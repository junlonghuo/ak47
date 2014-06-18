var path = require('path'),
    argv = require('optimist').argv,

    readline = require('readline'),
    manifest = require('./script/manifest.js'),
    init = require('./script/init.js'),
    packager = require('./script/pkg.js'),
    debug = require('./script/debug.js'),
    server = require('./script/server.js');

var rl = readline.createInterface({input: process.stdin, output: process.stdout});

exports.invoke = function () {
    var cmd = argv._[0];
    switch (cmd) {
        case 'pkg':
        case 'package':
            var oldVer = packager.getVer(process.cwd());
            getOption([
                {k: 'version', d: oldVer},
                {k: 'environ', d: 'dev'}
            ], packager.run);
            break;
        case 'server':
            server.run();
            break;
        case 'debug':
            debug.run();
            break;
        case 'init':
            var oldVerPath = path.join(process.cwd(), 'Manifest.xml');
            var oldOption = manifest.get(oldVerPath, ['appid', 'name', 'version', 'descriptor']);
            getOption([
                {k: 'appid', d: oldOption['appid'] || ''},
                {k: 'name', d: oldOption['name'] || 'H5App'},
                {k: 'version', d: oldOption['version'] || '1.0.0.0'},
                {k: 'url', d: oldOption['url'] || '/www/index.htm'},
                {k: 'descriptor', d: oldOption['descriptor'] || ''}
            ], init.run);
            break;
    }
};

function getOption(cfgs, callback) {
    var option = {}, cfg;

    function next() {
        cfg = cfgs.shift();
        var desc = !cfg.d ? "" : ("(" + cfg.d + ")");
        rl.setPrompt(cfg.k + ":" + desc + " ");
        rl.prompt();
    }

    next();
    rl.on('line',function (value) {
        option[cfg.k] = value || cfg.d || "";
        if (cfgs.length) {
            next();
        } else {
            rl.close();
        }
    }).on('close', function () {
            callback(option);
        });
}