/**
 *
 * AB aliBridge
 * @namespace AB
 * @author 仈爪 <haibin.zhb@alipay.com>
 * @version 1.0.0
 *
 * */
;
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {// 兼容 CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {// 兼容 AMD / RequireJS / seaJS
        define(factory);
    } else {
        root.AB = factory.call(root);      //如果不使用模块加载器则自动生成全局变量
    }
}(this, function () {
    'use strict';

    function AliBridge() {
    }

    /**
     *
     * @type {Function}
     * @private
     */
    AliBridge._call = AliBridge.call;
    /**
     * 通用接口，调用方式等同AlipayJSBridge.call
     * 无需考虑接口的执行上下文，必定调用成功
     * 会自动处理调用接口的向下兼容
     *
     * 可能会导致执行时间不符合预期
     */
    AliBridge.call = function () {
        var a = Array.prototype.slice.call(arguments, 0), fn = function () {
            var option = a[1];
            switch (a[0]) {
                case 'pushWindow':
                    var aEl = document.createElement('a');
                    aEl.href = option.url;
                    option.url = aEl.href;
                    break;
                case 'popWindow':
                    a[1] = a[1] || {};
                    break;
                case 'photo':
                    break;
                case 'share':
                    break;
            }
            window.AlipayJSBridge.call.apply(null, a);
        };
        window.AlipayJSBridge ? fn() : AliBridge.on("AlipayJSBridgeReady", fn);
    };

    /**
     * toast
     * @param {string|object} opt 调用参数，可为对象或字符串
     * @param {function|string} [fn] 回调函数，如果为字符串则自动识别为类型
     * @param {string} [type] toast类型，success、fail
     */
    AliBridge.toast = function (opt, fn, type) {
        var def = {};
        if (isStr(fn)) {
            type = fn;
            fn = undefined;
        }
        if (isStr(opt)) {
            def.content = opt;
            !!type && (def.type = type);
        } else if (isObj(opt)) {
            def = simpleExtend(def, opt);
        } else {
            console.error('toast invoke error,opt error');
        }
        AliBridge.call('toast', def, fn);
    };

    /**
     * pushWindow
     * @param {string|object} path 调用参数，可为对象或字符串
     * @param {object} [opt] 执行参数，覆盖至param对象
     */
    AliBridge.pushWindow = function (path, opt) {
        var def;
        if (isObj(path)) {
            def = path;
        } else {
            def = {
                url: path,
                param: {}
            };
            simpleExtend(def.param, opt);
        }
        //兼容8.0，转化为绝对路径
        AliBridge.call('pushWindow', def);
    };


    /**
     * 绑定全局事件
     * @param {string} event 事件名称
     * @param {function} [fn] 回调函数
     */
    AliBridge.on = function (event, fn) {
        document.addEventListener(event, fn, false);
    };

    function isStr(fn) {
        return 'string' === type(fn);
    }

    function isObj(o) {
        return 'object' === type(o);
    }

    function type(obj) {
        return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
    }

    function simpleExtend(target, source) {
        for (var k in source) {
            target[k] = source[k];
        }
        return target;
    }

    return AliBridge;
}));