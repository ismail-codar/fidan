fidan.createElement(AppBar, {
	className$: fidan.initCompute(function() {
		return classNames(classes.appBar, {
			open: open$.$val
		});
	}, open$)
});
