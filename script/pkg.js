/**
 *
 * ak47 pkg
 * @namespace ak47
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */

var fs = require('fs-extra'),
    path = require('path'),
    argv = require('optimist').argv,
    exec = require('child_process').exec;


exports.run = function (option) {
    var maniDir = path.join(process.cwd(), 'Manifest.xml');
    var oldVer = getVersion(maniDir);
    if (option.version !== oldVer) {
        updateManifest(maniDir, option);
    }
    pkg(option);
};


exports.getVer = function (rootDir) {
    var packageVer = getVersion(path.join(rootDir, 'Manifest.xml'));
    if (!packageVer) {
        throw new Error('version not found in Manifest');
    }
    return packageVer;
};

function updateManifest(maniDir, option) {
    var mstr = fs.readFileSync(maniDir).toString();
    mstr = mstr.replace(/(<version>)(.*)(<\/version>)/, '$1' + option['version'] + '$3');
    fs.writeFileSync(maniDir, mstr);
}


var pkg = function (option) {
    var rootDir = process.cwd();
    //开发版本
    var environ = option['environ'];

    //获取dist目录
    var distDir = path.join(rootDir, 'dist');
    //获取package根目录
    var packageDir = path.join(rootDir, 'package');

    //准备需打包的项目文件
    prepare(distDir, rootDir);
    pack(rootDir, packageDir, distDir, environ);
};

// 打包成amr
function pack(rootDir, packageDir, distDir, environ) {
    //获取版本号
    var packageVer = getVersion(path.join(rootDir, 'Manifest.xml'));
    if (!packageVer) {
        throw new Error('version not found in Manifest');
    }
    //获取应用id
    var packageId = getPackageId(path.join(rootDir, 'Manifest.xml'));
    if (!packageId) {
        throw new Error('appid not found in Manifest');
    }

    if (!fs.existsSync(packageDir)) {
        fs.mkdirsSync(packageDir);
    }
    process.chdir(distDir);
    var amr = path.join(packageDir, packageId + '-' + packageVer + '_' + environ + '.amr');
    if (fs.existsSync(amr)) {
        fs.removeSync(amr);
    }
    console.log('# archiving...');
    exec("zip -r '" + amr + "' *", function (err, stdout, stderr) {
        console.log('# packed at ' + amr.green);
        process.exit(0);
    });
}

// 预备文件
function prepare(_distDir, _rootDir) {
    var files;
    if (fs.existsSync(_distDir)) {
        fs.removeSync(_distDir);
    }
    fs.mkdirsSync(_distDir);

    var srcArr = ['res', 'www', 'Manifest.xml'];

    while (srcArr.length) {
        var name = srcArr.pop();
        var pathname = path.join(_rootDir, name);
        if (fs.existsSync(pathname)) {
            copySync(pathname, path.join(_distDir, name), [/debug\.js$/, /^alipay\.js$/]);
        } else {
            files = false;
            console.log(name + " not exist,check it please!");
            break;
        }
    }
    files !== false && (files = scan(_distDir));
    return files;
}

// 扫描目录, 删除不使用的文件
function scan(dir, del, base, out) {
    del = del || function (x) {
        return x[0] == '.' || x == 'CERT';
    };
    base = base || dir;
    out = out || [];
    fs.readdirSync(dir).forEach(function (name) {
        var fname = path.join(dir, name);
        if (del(name)) {
            fs.unlinkSync(fname);
        } else if (fs.statSync(fname).isDirectory()) {
            scan(fname, del, base, out);
        } else {
            out.push(fname.slice(base.length + 1));
        }
    });
    return out;
}


// 复制文件或目录, follow src中的符号链接
// dst只能是目标本身, 而非目标所在目录; 已存在的dst会被删除
// copy时文件整个读到内存
// 没有考虑符号链接无穷递归的情况
function copySync(src, dst, ignores) {
    var dir = path.dirname(src);
    var stats = fs.lstatSync(src);
    if (stats.isSymbolicLink()) {
        return copySync(path.resolve(dir, fs.readlinkSync(src)), dst, ignores);
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
            copySync(path.join(src, name), path.join(dst, name), ignores);
        });
    } else {
        var dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
            fs.mkdirsSync(path.dirname(dst));
        } else if (fs.existsSync(dst)) {
            fs.removeSync(dst);
        }
        fs.writeFileSync(dst, fs.readFileSync(src));
    }
}

// 读取Manifest里的版本号
function getVersion(fname) {
    var match = fs.readFileSync(fname).toString().match(/<version>(.+)<\/version>/);
    return match && match[1];
}
function getPackageId(fname) {
    var match = fs.readFileSync(fname).toString().match(/<uid>(.+)<\/uid>/);
    return match && match[1];
}