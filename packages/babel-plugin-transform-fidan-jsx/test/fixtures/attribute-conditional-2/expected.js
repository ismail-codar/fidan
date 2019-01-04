fidan.createElement(
	'div',
	{
		className: function(element) {
			fidan.compute(function() {
				element.className = d.id === state.selected.$val ? 'danger' : '';
			}, state.selected);
		}
	},
	'test'
);
