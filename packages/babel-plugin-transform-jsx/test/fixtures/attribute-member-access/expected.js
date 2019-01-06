fidan.createElement(
	'div',
	{
		className: function(element) {
			fidan.compute(function() {
				element.className = state.selected.$val;
			}, state.selected);
		}
	},
	'test'
);
