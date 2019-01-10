Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.ListView = void 0;
var ListView = function ListView(props) {
	return fidan.createElement('ul', null, function(element) {
		fidan.arrayMap(props.data$, element, function(item$) {
			return fidan.createElement(
				'li',
				null,
				'id:',
				item$.$val.id,
				'text:',
				fidan.createElement('strong', null, function(element) {
					element = fidan.createTextNode(element);
					fidan.compute(
						function() {
							element.textContent = item$.$val.text$.$val;
						},
						item$.$val.text$,
						item$
					);
				})
			);
		});
	});
};
exports.ListView = ListView;
