var normalizedValue$ = fidan.computeReturn(function() {
	if (props.value$.$val < 0) {
		return 0;
	}

	if (props.value$.$val > 100) {
		return 100;
	}

	return props.value$.$val;
}, props.value$);
