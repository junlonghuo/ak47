Array.prototype.run = function () {
	this.forEach(function (item) {
		item.start();
	});
};

Function.prototype.start = function () {
	this.befores && this.befores.run();
	this.call();
	this.afters && this.afters.run();
};

Function.prototype.before = function (fn) {
	var befores = this.befores || (this.befores = []);
	befores.push(fn);
};

Function.prototype.after = function (fn) {
	var afters = this.afters || (this.afters = []);
	afters.push(fn);
};

function simple(callback) {
	setTimeout(callback, 1000);
}

function task(limit) {
	if (!limit) {
		limit = 1;
	}
	var items = [],
		working = 0;
		befores = [],
		afters = [];
	function next() {
		if (working >= limit) {
			return;
		}
		var item = items.shift()
		if (!item) {
			if (!working) {
				afters.run();
				return;
			}
			return;
		}
		++working;
		item.after(next);
		item.start();
		next();
	}
	return {
		add: function (item) {
			items.push(item)
		},
		start: function () {
			before.start().then(next);
		},
		before: function (item) {
			befores.push(item)
		},
		after: function (item) {
			afters.push(item);
		}
	};
}