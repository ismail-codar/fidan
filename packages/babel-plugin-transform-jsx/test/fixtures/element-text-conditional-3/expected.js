fidan.createElement('div', null, function(element) {
	var oldElement;
	fidan.compute(function() {
		oldElement = fidan.conditionalElement(element, oldElement, function() {
			return todo.showing$.$val ? fidan.createElement('span', null, 'showing') : null;
		});
	}, todo.showing$);
});
