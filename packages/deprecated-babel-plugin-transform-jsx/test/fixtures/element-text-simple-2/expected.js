var a$ = fidan.value(1),
  b$ = fidan.initCompute(function _() {
    return a$.$val * 2;
  }, a$);
fidan.createElement("div", null, function _2(element) {
  element = fidan.createTextNode(element);
  fidan.compute(function _3() {
    element.textContent = b$.$val;
  }, b$);
});
