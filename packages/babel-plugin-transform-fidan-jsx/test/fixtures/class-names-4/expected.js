fidan.createElement(Component, {
	className: function(element) {
		fidan.compute(function() {
			element.className = classNames({
				entered: props.open$.$val === true
			});
		}, props.open$);
	}
});
