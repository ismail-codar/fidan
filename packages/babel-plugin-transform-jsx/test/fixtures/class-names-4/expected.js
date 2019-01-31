fidan.createElement(Component, {
	className: classNames({
		entered: props.open$.$val === true
	})
});
fidan.createElement(Component_, {
	className: function(element) {
		fidan.compute(function() {
			element.className = classNames({
				entered: props.open$.$val === true
			});
		}, props.open$);
	}
});
fidan.createElement('div', {
	className: function(element) {
		fidan.compute(function() {
			element.className = classNames({
				entered: props.open$.$val === true
			});
		}, props.open$);
	}
});
