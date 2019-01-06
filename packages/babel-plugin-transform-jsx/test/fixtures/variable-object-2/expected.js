var obj$ = fidan.initCompute(function() {
	return {
		data: 1,
		value$: value$,
		valueX: value$.$val,
		amount$: fidan.initCompute(function() {
			return value$.$val + data;
		}, value$)
	};
}, value$);
