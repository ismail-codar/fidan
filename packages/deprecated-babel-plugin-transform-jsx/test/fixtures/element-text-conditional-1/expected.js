var value$ = fidan.value(false);
fidan.createElement("div", null, function _(element) {
  var oldElement;
  fidan.computed(function _2() {
    oldElement = fidan.conditionalElement(element, oldElement, function() {
      return value$.$val == true
        ? "yes"
        : fidan.createElement("strong", null, "no");
    });
  }, value$);
});
