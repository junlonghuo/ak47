var iniparser = require('iniparser'),
	fs = require('fs');

module.exports = {
	replace: replace,
	remove: remove,
	removeTag: removeTag,
	inject: inject
};

function replace(iniFile, environ, watch) {
	if (!fs.existsSync(iniFile)) {
		iniFile && console.log('- ini file not found ' + iniFile);
		return function(x) {
			return x;
		};
	}

	var dictionary = {};
	var own = Object.prototype.hasOwnProperty;

	var update = function () {
		if (!fs.existsSync(iniFile)) {
			dictionary = {};
			return;
		}
		var data = iniparser.parseSync(iniFile);
		if (!data[environ]) {
			throw new Error('env ' + environ + ' not found in ' + iniFile);
		}
		dictionary = data[environ];
	};
	if (watch !== false) {
		fs.watch(iniFile, update);
	}
	update();

	return function (text) {
		return text.replace(/@\{(\w+)\}/g, function (_, name) {
			return own.call(dictionary, name) ? dictionary[name] : '';
		});
	};
}

function remove(regex) {
	var array = [].slice.call(arguments, 1);
	var test = function (str) {
		return !array.length || array.some(function (item) {
			if (item instanceof Function) return item(str);
			if (item instanceof RegExp) return item.test(str);
			return str.indexOf(item) >= 0;
		});
	};
	return function (html) {
		return html.replace(regex, function (str) {
			return test(str) ? '' : str;
		});
	};
}

function removeTag(name) {
	var alone = /^(link|meta)/.test(name);
	var pttrn = '[\\t ]*<' + name + '\\b[^>]*>';
	if (!alone) {
		pttrn += '[\\s\\S]*?</' + name + '>';
	}
	pttrn += '(\\n|$)';
	arguments[0] = new RegExp(pttrn);
	return remove.apply(null, arguments);
}

function inject(type, url, after) {
	var code, tag, end;
	if (type == 'script') {
		code = '<script src="' + url + '"></script>';
		tag = 'script';
		end = '</script>'
	} else {
		code = '<link rel="stylesheet" href="' + url + '" />';
		tag = 'link';
		end = '>';
	}
	var regex = new RegExp('(\\n[\\t ]*)(?=<'+tag+'\\b)', after ? 'ig' : 'i');
	return function (html) {
		if (after) {
			var tmp, match, index;
			while (tmp = regex.exec(html)) {
				match = tmp;
			}
			if (match && (index = html.indexOf(end, match.index + 1)) >= 0) {
				index += end.length;
				return html.slice(0, index) + match[0] + code + html.slice(index);
			}
			return html;
			
		} else {
			return html.replace(regex, function (_, spaces) {
				return spaces + code + spaces;
			});
		}
	};
}