/**
 *
 * ak47 debug
 * @namespace ak47
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */

var path = require('path'),
    fs = require('fs'),
    argv = require('optimist').argv,
    colors = require('colors'),
    coffee = require('coffee-script'),
    server = require('./server.js');

exports.run = function () {
    var weinreDir = path.join(__dirname, '../weinre/lib/cli');
    require(weinreDir).run();
    server.run(true);
};

