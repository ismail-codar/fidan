var a$ = fidan.value(1),
	b$ = fidan.initCompute(function() {
		return a$.$val * 2;
	}, a$);
fidan.createElement('div', null, function(element) {
	element = fidan.createTextNode(element);
	fidan.compute(function() {
		element.textContent = b$.$val;
	}, b$);
});
