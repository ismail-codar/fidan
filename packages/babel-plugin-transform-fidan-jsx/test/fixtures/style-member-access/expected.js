var width = fidan.value(200);
fidan.createElement(
	'div',
	{
		style: {
			color: 'red',
			width: function(element) {
				fidan.compute(function() {
					element.style.width = width.$val;
				}, width);
			}
		}
	},
	'test'
);
