fidan.createElement(
	'div',
	{
		className: function(element) {
			fidan.compute(
				function() {
					element.className = classNames(
						{
							editing: data.editing.$val,
							completed: data.completed.$val
						},
						data.highlight.$val
					);
				},
				data.editing,
				data.completed,
				data.highlight
			);
		}
	},
	'test'
);
