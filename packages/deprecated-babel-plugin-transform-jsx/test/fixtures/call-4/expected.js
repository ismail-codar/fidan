var todoCtrl1 = {
	filterBy: function filterBy(filter) {}
};
var filterType1$ = fidan.value('');
fidan.computed(function() {
	todoCtrl1.filterBy(filterType1$.$val);
}, filterType1$);
