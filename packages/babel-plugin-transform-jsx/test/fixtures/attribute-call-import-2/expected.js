var _util = require('./util');
var View = function View(props) {
	var linkText$ = fidan.value('');
	return fidan.createElement('a', {
		href: function(element) {
			fidan.compute(function() {
				element.href = (0, _util.linkUrl)(linkText$.$val);
			}, linkText$);
		}
	});
};
