// @tracked
fidan("div", null, function(element) {
  var oldElement;
  fjsx.compute(function() {
    oldElement = fjsx.conditionalElement(element, oldElement, function() {
      return item.value$.$val == true
        ? "yes"
        : fidan("strong", null, "no");
    });
  }, item.value$);
});
