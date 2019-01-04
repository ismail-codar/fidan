'use strict';

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
}

var name1$ = fjsx.value('');
var surname1$ = fjsx.value('');

var Test1 = function Test1() {
	_classCallCheck(this, Test1);

	this.value$ = fjsx.value(1);
	this.name$ = name1$;
	this.fullname$ = fjsx.initCompute(
		function() {
			return name1$.$val + ' ' + surname1$.$val;
		},
		name1$,
		surname1$
	);
	this.id = 0;
};
