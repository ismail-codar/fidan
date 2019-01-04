// @tracked
var arr = fidan.array([]);
fidan.createElement('div', null, 'list:', function(element) {
	fidan.arrayMap(arr, element, function(item, index) {
		return item;
	});
});
