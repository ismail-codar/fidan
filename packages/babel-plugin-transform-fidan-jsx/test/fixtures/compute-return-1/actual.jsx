const normalizedValue$ = fjsx.computeReturn(function() {
	if (props.value$ < 0) {
		return 0;
	}

	if (props.value$ > 100) {
		return 100;
	}

	return props.value$;
});
