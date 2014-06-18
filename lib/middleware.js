// http中间件

var url = require('url'),
    path = require('path'),
    qrCode = require('qrcode-npm'),
    fs = require('fs'),
    pre = require('./pre.js');

function write(res, mime, str) {
    res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': Buffer.byteLength(str)
    });
    res.end(str);
}

//exports.mock = function (mockUri, baseDir) {
//    return function mockHandler(req, res, next) {
//        var obj = url.parse(req.url);
//        if (obj.pathname != mockUri) {
//            return next();
//        }
//
//        var output = function (code, result, message) {
//            var data = JSON.stringify({
//                resultStatus: code,
//                result: result,
//                memo: message
//            });
//            write(res, 'application/json', data);
//        };
//        var success = function (result) {
//            output(1000, result, '');
//        };
//        var error = function (code, message) {
//            output(code, null, message);
//        };
//
//        // 参数检查
//        var operationType = req.body.operationType;
//        if (!operationType) {
//            return error(3000, '缺少操作类型');
//        }
//        var requestData = req.body.requestData;
//        if (!requestData) {
//            return error(3001, '请求数据为空');
//        }
//        var params = {};
//        try {
//            JSON.parse(requestData).forEach(function (item) {
//                for (var key in item) {
//                    params[key] = item[key];
//                }
//            });
//        } catch (e) {
//            return error(3002, '数据格式有误');
//        }
//
//        // try handle with js
//        var script = path.join(baseDir, operationType + '.js');
//        if (fs.existsSync(script)) {
//            try {
//                var handle = require(script),
//                    result = handle(params),
//                    delay = handle.delay;
//                delete require.cache[script];
//                return delay ? setTimeout(success.bind(null, result), delay) : success(result);
//            } catch (e) {
//                return error(5000, e.message);
//            }
//        }
//
//        // try response with json
//        var json = path.join(baseDir, operationType + '.json');
//        if (fs.existsSync(json)) {
//            var buffer = fs.readFileSync(json), result;
//            try {
//                result = JSON.parse(buffer.toString());
//            } catch (e) {
//                return error(4002, 'JSON模拟数据错误');
//            }
//            return success(result);
//        }
//
//        // unsupported
//        return error(3000, '操作类型不支持');
//    };
//};

//exports.redirect = function (rootDir, debugHost, isDebug) {
//    if (isDebug === true) {
//        return function (req, res, next) {
//            var file = url.parse(req.url).pathname;
//            if (file === '/debug') {
//                return res.redirect(debugHost + '/target/target-script-min.js#anonymous');
//            }
//        }
//    }
//};


exports.modify = function (rootDir, debugHost, option, isDebug) {
//	var replace = pre.replace(iniFile, environ);
//	var inject = pre.inject('script', 'share/wallet/trunk/src/alipay.js');
//	var remove = pre.removeTag('script', '/alipay.js"');
    debugHost += '/target/target-script-min.js#anonymous';
    var inject = pre.inject('script', debugHost);

    return function (req, res, next) {
        if ('GET' != req.method) {
            return next();
        }
        var file = url.parse(req.url).pathname;
        if (file.slice(-1) == '/') {
            file += option.indexName;
        }

        if (file === '/qr') {
            var qr = qrCode.qrcode(4, 'M');
            var host = 'http://' + req.headers.host + '/';
            var index = host + option.indexName;
            var qrPath = host + 'qr';
            var scheme = 'alipays://platformapi/startapp?appId=20000067&url=' + index;
            !!option['showTitleBar'] && (scheme += '&showTitleBar=' + option['showTitleBar']);
            !!option['showToolBar'] && (scheme += '&showToolBar=' + option['showToolBar']);

            qr.addData(qrPath);
            qr.make();
            var imgTag = qr.createImgTag(8);
            imgTag = '<h2>启动页：' + index + '</h2>' + imgTag;
            imgTag += '<iframe src="' + scheme + '" style="display:none;"></iframe>';
            write(res, 'text/html', imgTag);
        } else {
            var ext = path.extname(file);
            if (!(file == '/' || ext == '.html' || ext == '.htm' || ext == '.js')) {
                return next();
            }
            var fname = path.join(rootDir, file);
            if (!fs.existsSync(fname)) {
                return next();
            }

            var content = fs.readFileSync(fname).toString();
            //        replace(content);

            if ((ext == '.html' || ext == '.htm') && isDebug === true) {
                content += '<script src="' + debugHost + '"></script>';
            }
            var mime = ext == '.js' ? 'text/javascript' : 'text/html';
            write(res, mime, content);
        }
    };
};