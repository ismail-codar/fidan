Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.ListView = void 0;
var ListView = function ListView(props) {
	///Users/macbook/DEV/GitHub/fidan/spec/array-map.ts
	return fidan.createElement('ul', null, function(element) {
		const updateList = [];
		const renderTemplate = (i) => {
			const item$ = props.data$[i];
			return fidan.createElement('li', null, 'id:', item$.$val.id, 'text:', () => {
				updateList.push({
					path: [ 2, 0 ],
					update: function(element, data, i) {
						const item$ = data[i];
						element = fidan.createTextNode(element);
						fidan.computed(
							function() {
								element.textContent = item$.$val.text$.$val;
							},
							item$.$val.text$,
							item$
						);
					}
				});
				return item$.$val.text$.$val;
			});
		};
		fidan.arrayMapWithClone(props.data$, element, renderTemplate, updateList);
	});
};
exports.ListView = ListView;
