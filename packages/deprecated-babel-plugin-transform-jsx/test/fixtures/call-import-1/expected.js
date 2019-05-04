var _types = require('./types');
var filteredData$ = fidan.value(gridData);
var Grid1 = function Grid1(props) {
	_types.controller.sortBy(filteredData$);
};
