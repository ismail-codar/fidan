var todoCtrl1 = {
  filterBy: function filterBy(filter) {}
};
var $filterType1 = fjsx.value("");
fjsx.compute(function() {
  todoCtrl1.filterBy($filterType1.$val);
}, $filterType1);
