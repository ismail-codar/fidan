fidan.createElement('div', null, function(element) {
	var oldElement;
	fidan.compute(function() {
		oldElement = fidan.conditionalElement(element, oldElement, function() {
			return item.value$.$val == true ? 'yes' : fidan.createElement('strong', null, 'no');
		});
	}, item.value$);
});
