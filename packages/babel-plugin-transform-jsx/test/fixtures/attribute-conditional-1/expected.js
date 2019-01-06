var selectedClass$ = fidan.value('danger');
fidan.createElement(
	'div',
	{
		className: function(element) {
			fidan.compute(function() {
				element.className = 'none' === selectedClass$.$val ? 'danger' : '';
			}, selectedClass$);
		}
	},
	'test'
);
