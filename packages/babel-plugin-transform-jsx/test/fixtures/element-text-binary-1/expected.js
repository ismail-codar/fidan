fidan.createElement(fidan.Fragment, null, function(element) {
	element = fidan.createTextNode(element);
	fidan.compute(
		function() {
			element.textContent = state.item1.$val * (state.item2.$val + state.item3.$val);
		},
		state.item1,
		state.item2,
		state.item3
	);
});
