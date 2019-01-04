fidan.createSvgElement('rect', {
	x: function(element) {
		fidan.compute(function() {
			element.setAttribute('x', x$.$val);
		}, x$);
	}
});
