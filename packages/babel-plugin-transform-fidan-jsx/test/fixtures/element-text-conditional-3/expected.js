fidan("div", null, function(element) {
  var oldElement;
  fjsx.compute(function() {
    oldElement = fjsx.conditionalElement(element, oldElement, function() {
      return todo.showing$.$val
        ? fidan("span", null, "showing")
        : null;
    });
  }, todo.showing$);
});
