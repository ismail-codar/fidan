declare var fjsx;
var todoCtrl1 = {
  filterBy(filter) {}
};
// @tracked
var $filterType1 = "";
fjsx.compute(() => {
  todoCtrl1.filterBy($filterType1);
}, $filterType1);
