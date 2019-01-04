var list = fidan.array([
	{
		title: fidan.value('a')
	},
	{
		title: fidan.value('b')
	},
	{
		title: fidan.value('c')
	}
]);
list.$val.push({
	title: fidan.value('d')
});
var ul1 = fidan.createElement('ul', null, function(element) {
	fidan.arrayMap(list, element, function(
		// @track_keys id|title
		item
	) {
		return fidan.createElement('li', null, item.title.$val);
	});
});
