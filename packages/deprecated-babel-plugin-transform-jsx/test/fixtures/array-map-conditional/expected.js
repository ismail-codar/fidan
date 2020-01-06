fidan.createElement("div", null, "list:", function _(element) {
  fidan.arrayMap(props.data, element, function(item, index) {
    return function _2(element) {
      var oldElement;
      fidan.computed(function _3() {
        oldElement = fidan.conditionalElement(element, oldElement, function() {
          return item.$val % 2 == 0
            ? item.$val
            : fidan.createElement("strong", null, "item:", function _4(
                element
              ) {
                element = fidan.createTextNode(element);
                fidan.computed(function _5() {
                  element.textContent = item.$val;
                }, item);
              });
        });
      }, item);
    };
  });
});
