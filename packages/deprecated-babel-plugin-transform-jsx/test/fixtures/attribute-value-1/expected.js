var value1$ = fidan.value("1");
var input1 = fidan.createElement("input", {
  type: "text",
  value: function _(element) {
    fidan.computed(function _2() {
      element.value = value1$.$val;
    }, value1$);
  }
});
