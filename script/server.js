/**
 *
 * ak47 server
 * @namespace ak47
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */

var connect = require('connect'),
    redirect = require('connect-redirection'),
    manifest = require('./manifest.js'),
    url = require('url'),
    argv = require('optimist').argv,
    fs = require('fs-extra'),
    mw = require('../lib/middleware.js'),
    colors = require('colors'),
    path = require('path');
var os = require('os');

exports.run = function (isDebug) {
    var rootDir = process.cwd();
    var port = argv.p;
    //端口号
    port = port || 3000;

    //www网址
    var wwwroot = path.join(rootDir, 'www');

    if (!fs.existsSync(wwwroot)) {
        wwwroot = rootDir;
    }

    var option = manifest.get(path.join(rootDir, 'Manifest.xml'), ['url', 'showTitleBar', 'showToolBar']);

    option.indexName = option.url || 'index.htm';
    option.indexName = option.indexName.replace('/www/', '');




    if (!fs.existsSync(wwwroot)) {
        console.error('error:wwwroot not found: ' + wwwroot);
        return false;
    }
    var ips = getLocalIP();

    var debugPath = "http://" + ips[0] + ":3119";
    var clientPath = debugPath + "/client/#anonymous";

    connect()
        .use(connect.urlencoded())
        .use(mw.modify(wwwroot, debugPath, option, isDebug))
        .use(connect.static(wwwroot, {index: option.indexName}))
        .use(redirect())
        .use(function (req, res, next) {
            var file = url.parse(req.url).pathname;
            if (file === '/debug') {
                res.redirect(clientPath);
            } else {
                return next();
            }
        }).listen(port);

    console.log('# project = ' + rootDir);
    while (ips.length) {
        var ip = ips.pop();
        var host = 'http://' + ip + ':' + port + '/';
        isDebug === true && console.log('# debugPath(远程调试控制台地址) = '.yellow + (host + 'debug').green.underline);
        console.log('# webServer(web页面预览起始页) = '.yellow + (host + option.indexName).green.underline);
        console.log('# qrScheme(二维码服务) = '.yellow + (host + 'qr').green.underline);
        isDebug === true && console.log(('# debugScript(非本地页面需手动插入脚本) = <script src="' + debugPath + '/target/target-script-min.js#anonymous"></script>').grey);
    }

    console.log('# listening... ' + 'do not exit!'.yellow.bold);
};

function getLocalIP() {
    var map = [];
    var ifaces = os.networkInterfaces();
    for (var i in ifaces) {
        var ips = ifaces[i];
        while (ips.length) {
            var ip = ips.pop();
            if (ip.family === 'IPv4' && ip.address != '127.0.0.1') {
                map.push(ip.address);
            }
        }
    }
    !map.length && map.push('localhost');
    return map;
}



