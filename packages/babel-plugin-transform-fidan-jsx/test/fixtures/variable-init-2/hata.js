var normalizedValue$ = fjsx.initCompute(function() {
	return props.value$.$val < 0 ? props.value$.$val : props.value$;
}, props.value$);
