// @tracked
var value = fjsx.value(false);
fidan("div", null, function(element) {
  var oldElement;
  fjsx.compute(function() {
    oldElement = fjsx.conditionalElement(element, oldElement, function() {
      return value.$val == true
        ? "yes"
        : fidan("strong", null, "no");
    });
  }, value);
});
