fidan.createElement(
	'tr',
	null,
	gridColumns.map(function(col) {
		return fidan.createElement(
			'th',
			{
				className: function(element) {
					fidan.compute(function() {
						element.className = classNames({
							active: sortKey$.$val == col
						});
					}, sortKey$);
				},
				onClick: function onClick() {
					return sortBy(filteredData$.$val, col);
				}
			},
			fidan.createElement('span', null, col)
		);
	})
);
