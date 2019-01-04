var obj$ = fjsx.initCompute(function() {
	return {
		data: 1,
		value$: value$,
		valueX: value$.$val,
		amount$: fjsx.initCompute(function() {
			return value$.$val + data;
		}, value$)
	};
}, value$);
