/**
 *
 * ak47 manifest
 * @namespace ak47
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */

 var fs = require('fs-extra'),
    path = require('path');


exports.get = function (configFile, keys) {
    var option = {};
    if (fs.existsSync(configFile)) {
        var str = fs.readFileSync(configFile).toString();
        keys.forEach(function (v) {
            if (v === 'appid') v = 'uid';
            var rex = new RegExp('<' + v + '>(.*)<\/' + v + '>');
            var match = str.match(rex);
            if (match && match[1] !== undefined) {
                if (v == 'uid') v = 'appid';
                option[v] = match[1];
            }
        });
    }
    return option;
};

exports.set = function (configFile, option) {
    var str;
    if (fs.existsSync(configFile)) {
        str = fs.readFileSync(configFile).toString();
        for (var k in option) {
            var v = option[k];
            if (k === 'appid') {
                k = 'uid';
            }
            var rex = new RegExp('(<' + k + '>)(.*)(<\/' + k + '>)');
            str = str.replace(rex, '$1' + v + '$3');
        }
    }
    return str;
};