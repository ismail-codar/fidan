fidan.createElement("div", null, "list:", function _(element) {
  fidan.arrayMap(data, element, function(item, index) {
    item = index % 2 ? item * 2 : item * 3;
    return function _2(element) {
      var oldElement;
      fidan.computed(function _3() {
        oldElement = fidan.conditionalElement(element, oldElement, function() {
          return item.$val + 2 == 0
            ? fidan.createElement("strong", null, function _4(element) {
                element = fidan.createTextNode(element);
                fidan.computed(function _5() {
                  element.textContent = item.$val;
                }, item);
              })
            : item.$val;
        });
      }, item);
    };
  });
});
