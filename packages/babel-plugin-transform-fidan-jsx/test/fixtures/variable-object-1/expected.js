var obj = {
	data: 1,
	value$: value$,
	amount$: fidan.initCompute(function() {
		return value$.$val + data;
	}, value$)
};
