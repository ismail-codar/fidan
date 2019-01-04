var list = fjsx.array([
  {
    title: fjsx.value("a")
  },
  {
    title: fjsx.value("b")
  },
  {
    title: fjsx.value("c")
  }
]);
list.$val.push({
  title: fjsx.value("d")
});
var ul1 = fidan("ul", null, function(element) {
  fjsx.arrayMap(list, element, function(
    // @track_keys id|title
    item
  ) {
    return fidan("li", null, item.title.$val);
  });
});
