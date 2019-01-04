fidan.createElement('div', null, 'list:', function(element) {
	fidan.arrayMap(props.data, element, function(item, index) {
		return function(element) {
			var oldElement;
			fidan.compute(function() {
				oldElement = fidan.conditionalElement(element, oldElement, function() {
					return item.$val % 2 == 0
						? item.$val
						: fidan.createElement('strong', null, 'item:', function(element) {
								element = fidan.createTextNode(element);
								fidan.compute(function() {
									element.textContent = item.$val;
								}, item);
							});
				});
			}, item);
		};
	});
});
