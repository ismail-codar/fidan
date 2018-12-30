// https://stackoverflow.com/questions/5100376/how-to-watch-for-array-changes
export function EventedArray(items) {
	var _self = this,
		_array = [],
		_handlers = {
			itemadded: [],
			itemremoved: [],
			itemset: [],
			beforemulti: [],
			aftermulti: []
		};

	function defineIndexProperty(index) {
		if (!(index in _self)) {
			Object.defineProperty(_self, index, {
				configurable: true,
				enumerable: true,
				get: function() {
					return _array[index];
				},
				set: function(v) {
					_array[index] = v;
					raiseEvent({
						type: 'itemset',
						index: index,
						item: v
					});
				}
			});
		}
	}

	function raiseEvent(event) {
		_handlers[event.type].forEach(function(h) {
			h.call(_self, event);
		});
	}

	_self.on = function(eventName, handler) {
		_handlers[eventName].push(handler);
	};

	_self.off = function(eventName, handler) {
		var h = _handlers[eventName];
		var ln = h.length;
		while (--ln >= 0) {
			if (h[ln] === handler) {
				h.splice(ln, 1);
			}
		}
	};

	_self.push = function() {
		var index;
		arguments.length > 1 &&
			raiseEvent({
				type: 'beforemulti'
			});
		for (var i = 0, ln = arguments.length; i < ln; i++) {
			index = _array.length;
			_array.push(arguments[i]);
			defineIndexProperty(index);
			raiseEvent({
				type: 'itemadded',
				index: index,
				item: arguments[i]
			});
		}
		arguments.length > 1 &&
			raiseEvent({
				type: 'aftermulti'
			});
		return _array.length;
	};

	_self.pop = function() {
		if (_array.length > -1) {
			var index = _array.length - 1,
				item = _array.pop();
			delete _self[index];
			raiseEvent({
				type: 'itemremoved',
				index: index,
				item: item
			});
			return item;
		}
	};

	_self.unshift = function() {
		for (var i = 0, ln = arguments.length; i < ln; i++) {
			_array.splice(i, 0, arguments[i]);
			defineIndexProperty(_array.length - 1);
			raiseEvent({
				type: 'itemadded',
				index: i,
				item: arguments[i]
			});
		}
		for (; i < _array.length; i++) {
			raiseEvent({
				type: 'itemset',
				index: i,
				item: _array[i]
			});
		}
		return _array.length;
	};

	_self.shift = function() {
		if (_array.length > -1) {
			var item = _array.shift();
			delete _self[_array.length];
			raiseEvent({
				type: 'itemremoved',
				index: 0,
				item: item
			});
			return item;
		}
	};

	_self.splice = function(index, howMany /*, element1, element2, ... */) {
		var removed = [],
			item,
			pos;

		index = index == null ? 0 : index < 0 ? _array.length + index : index;

		howMany = howMany == null ? _array.length - index : howMany > 0 ? howMany : 0;

		while (howMany--) {
			item = _array.splice(index, 1)[0];
			removed.push(item);
			delete _self[_array.length];
			raiseEvent({
				type: 'itemremoved',
				index: index + removed.length - 1,
				item: item
			});
		}

		for (var i = 2, ln = arguments.length; i < ln; i++) {
			_array.splice(index, 0, arguments[i]);
			defineIndexProperty(_array.length - 1);
			raiseEvent({
				type: 'itemadded',
				index: index,
				item: arguments[i]
			});
			index++;
		}

		return removed;
	};

	Object.defineProperty(_self, 'length', {
		configurable: false,
		enumerable: false,
		get: function() {
			return _array.length;
		},
		set: function(value) {
			var n = Number(value);
			var length = _array.length;
			if (n % 1 === 0 && n >= 0) {
				if (n < length) {
					_self.splice(n);
				} else if (n > length) {
					_self.push.apply(_self, new Array(n - length));
				}
			} else {
				throw new RangeError('Invalid array length');
			}
			_array.length = n;
			return value;
		}
	});

	Object.defineProperty(_self, 'innerArray', {
		configurable: false,
		enumerable: false,
		get: function() {
			return _array;
		},
		set: function(v) {
			// _self.push.apply(_self, v); // renderAll
			_array = v;
			for (var i = 0; i < v.length; i++) {
				defineIndexProperty(i);
			}
		}
	});

	Object.getOwnPropertyNames(Array.prototype).forEach(function(name) {
		if (!(name in _self)) {
			Object.defineProperty(_self, name, {
				configurable: false,
				enumerable: false,
				writable: false,
				value: Array.prototype[name]
			});
		}
	});

	_self.toJSON = () => {
		return _array;
	};

	if (items instanceof Array) {
		_self.push.apply(_self, items);
	}
}
