/**
 *
 * ak47 init
 * @namespace ak47
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */

var fs = require('fs-extra'),
    manifest = require('./manifest.js'),
    path = require('path');

exports.run = function (option) {
    init(option);
};

function init(option) {
    var tplDir = path.resolve(__dirname, '../app_tpl');
    var projectDir = process.cwd();
    copySync(option, tplDir, projectDir, [/debug\.js$/, /^alipay\.js$/]);
    console.log('# ' + 'H5App init success!'.green);
}

// 复制文件或目录, follow src中的符号链接
// dst只能是目标本身, 而非目标所在目录; 已存在的dst不会被替换
// copy时文件整个读到内存
// 没有考虑符号链接无穷递归的情况
function copySync(option, src, dst, ignores) {
    var dir = path.dirname(src);
    var stats = fs.lstatSync(src);
    if (stats.isSymbolicLink()) {
        return copySync(option, path.resolve(dir, fs.readlinkSync(src)), dst, ignores);
    }
    if (stats.isDirectory()) {
        if (!fs.existsSync(dst)) {
            fs.mkdirsSync(dst);
        }
        fs.readdirSync(src).forEach(function (name) {
            for (var i = 0; i < (ignores || []).length; ++i) {
                if (ignores[i].test(name)) {
                    return;
                }
            }
            copySync(option, path.join(src, name), path.join(dst, name), ignores);
        });
    } else {
        var dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
            fs.mkdirsSync(path.dirname(dst));
        }
        if (fs.existsSync(dst)) {
            console.log('Fail! Exist: '.red + dst);
        } else {
            if (!(/\/Manifest\.xml$/.test(src))) {
                fs.writeFileSync(dst, fs.readFileSync(src));
            } else {
                var mstr = manifest.set(src, option);
                fs.writeFileSync(dst, mstr);
            }
        }
    }
}
