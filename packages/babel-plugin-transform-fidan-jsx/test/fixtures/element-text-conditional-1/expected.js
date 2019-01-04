// @tracked
var value = fidan.value(false);
fidan.createElement('div', null, function(element) {
	var oldElement;
	fidan.compute(function() {
		oldElement = fidan.conditionalElement(element, oldElement, function() {
			return value.$val == true ? 'yes' : fidan.createElement('strong', null, 'no');
		});
	}, value);
});
