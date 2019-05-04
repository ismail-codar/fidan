declare var fidan;
var todoCtrl1 = {
	filterBy(filter) {}
};
var filterType1$ = '';
fidan.compute(() => {
	todoCtrl1.filterBy(filterType1$);
}, filterType1$);
