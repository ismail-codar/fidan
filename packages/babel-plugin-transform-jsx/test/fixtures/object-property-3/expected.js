props.z$ = fidan.initCompute(function() {
	return y$.$val + 1;
}, y$);
