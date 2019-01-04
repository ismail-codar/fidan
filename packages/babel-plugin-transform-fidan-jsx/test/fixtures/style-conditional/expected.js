var width = fidan.value(500);
fidan.createElement(
	'div',
	{
		style: {
			color: 'red',
			width: function(element) {
				fidan.compute(function() {
					element.style.width = width.$val < 200 ? width.$val : 200;
				}, width);
			}
		}
	},
	'test'
);
