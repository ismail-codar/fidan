fidan.createElement("div", null, function _(element) {
  var oldElement;
  fidan.computed(function _2() {
    oldElement = fidan.conditionalElement(element, oldElement, function() {
      return todo.showing$.$val
        ? fidan.createElement("span", null, "showing")
        : null;
    });
  }, todo.showing$);
});
