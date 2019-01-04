fjsx.createSvgElement("rect", {
  x: function(element) {
    fjsx.compute(function() {
      element.setAttribute("x", x$.$val);
    }, x$);
  }
});
