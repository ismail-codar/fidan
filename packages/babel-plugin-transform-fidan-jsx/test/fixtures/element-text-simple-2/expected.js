var a = fjsx.value(1),
  b = fjsx.initCompute(function() {
    return a.$val * 2;
  }, a);
fidan("div", null, function(element) {
  element = fjsx.createTextNode(element);
  fjsx.compute(function() {
    element.textContent = b.$val;
  }, b);
});
