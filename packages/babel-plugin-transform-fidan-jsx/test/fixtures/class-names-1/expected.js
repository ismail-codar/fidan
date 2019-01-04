// @tracked
var editing = fidan.value(null),
	completed = fidan.value(false),
	highlight = fidan.value(true);
fidan.createElement(
	'div',
	{
		className: function(element) {
			fidan.compute(
				function() {
					element.className = classNames(
						{
							editing: editing.$val,
							completed: completed.$val
						},
						highlight.$val
					);
				},
				editing,
				completed,
				highlight
			);
		}
	},
	'test'
);
