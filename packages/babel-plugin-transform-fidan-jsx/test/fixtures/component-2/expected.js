'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.DemoView = void 0;

var DemoView = function DemoView(props) {
	// @tracked_set
	var data = props.data;
	return fidan.createElement('div', null, function(element) {
		element = fidan.createTextNode(element);
		fidan.compute(function() {
			element.textContent = data.$val;
		}, data);
	});
};

exports.DemoView = DemoView;
