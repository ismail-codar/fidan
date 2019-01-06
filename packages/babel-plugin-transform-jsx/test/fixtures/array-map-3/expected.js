fidan.createElement('div', null, 'list:', function(element) {
	fidan.arrayMap(data, element, function(item, index) {
		item = index % 2 ? item * 2 : item * 3;
		return function(element) {
			var oldElement;
			fidan.compute(function() {
				oldElement = fidan.conditionalElement(element, oldElement, function() {
					return item.$val + 2 == 0
						? fidan.createElement('strong', null, function(element) {
								element = fidan.createTextNode(element);
								fidan.compute(function() {
									element.textContent = item.$val;
								}, item);
							})
						: item.$val;
				});
			}, item);
		};
	});
});
