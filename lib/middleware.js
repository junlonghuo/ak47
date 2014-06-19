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
        var _url = req.url;
        var file = url.parse(req.url).pathname;
        if (file.slice(-1) == '/') {
            file += option.indexName;
        }

        var host = 'http://' + req.headers.host + '/';
        if (file === '/scheme') {
            var _schemeUrl = getQueryString(_url, 'url') || '';
            var _schemeUrl2 = "";
            try {
                _schemeUrl2 = decodeURIComponent(_schemeUrl);
            } catch (e) {
            }
            var scheme = 'alipays://platformapi/startapp?appId=20000067&url=' + _schemeUrl;
            !!option['showTitleBar'] && (scheme += '&showTitleBar=' + option['showTitleBar']);
            !!option['showToolBar'] && (scheme += '&showToolBar=' + option['showToolBar']);

            var html = '<h1>alipay scheme:' + _schemeUrl2 + '<br/>(Reload page to relaunch)</h1>'
            html += '<iframe src="' + scheme + '" style="display:none;"></iframe>';
            write(res, 'text/html', html);
        } else if (file === '/qr') {
            var _index = getQueryString(_url, 'index') || '';
            try {
                _index = decodeURIComponent(_index);
            } catch (e) {
            }
            _index = _index || option.indexName;
            var _path = host + _index;

            var schemePath = host + 'scheme?url=' + encodeURIComponent(_path);

            var qr1 = qrCode.qrcode(8, 'M');
            qr1.addData(_path);
            qr1.make();
            var imgTag1 = qr1.createImgTag(4);

            var qr2 = qrCode.qrcode(8, 'M');
            qr2.addData(schemePath);
            qr2.make();
            var imgTag2 = qr2.createImgTag(4);

            var table = '<table>';
            table += '<tr><td colspan=2><label>' + host + '</label><input id="index" type="text" size="30" value="' + _index + '"/><button id="remake">重新生成</button></td></tr>';
            table += '<tr><td style="padding:0 30px;">' + imgTag1 + '</td><td style="padding:0 30px;">' + imgTag2 + '</td></tr>';
            table += '<tr><td style="text-align: center;">' + '自带浏览器启动' + '</td><td style="text-align: center;">' + '支付宝钱包启动' + '</td></tr>';
            table += '</table>';
            table += '<script>' +
                'var remake=document.getElementById("remake");' +
                'remake.addEventListener("click",function(){' +
                'var index=document.getElementById("index").value || "";' +
                'index=encodeURIComponent(index);' +
                'location.href="' + host + 'qr?index="+index;' +
                '},false);' +
                '</script>';

            write(res, 'text/html', table);
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

function getQueryString(path, key) {
    var reg = new RegExp("(^|\\?|&)" + key + "=([^&]*)(\\s|&|$)", "i");
    if (reg.test(path)) return RegExp.$2.replace(/\+/g, " ");
}