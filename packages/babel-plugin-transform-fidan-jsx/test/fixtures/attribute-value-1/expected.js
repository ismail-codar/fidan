var value1 = fidan.value('1');
var input1 = fidan.createElement('input', {
	type: 'text',
	value: function(element) {
		fidan.compute(function() {
			element.value = value1.$val;
		}, value1);
	}
});
