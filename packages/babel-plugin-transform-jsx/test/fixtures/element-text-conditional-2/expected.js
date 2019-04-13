fidan.createElement("div", null, function _(element) {
  var oldElement;
  fidan.compute(function _2() {
    oldElement = fidan.conditionalElement(element, oldElement, function() {
      return item.value$.$val == true
        ? "yes"
        : fidan.createElement("strong", null, "no");
    });
  }, item.value$);
});
