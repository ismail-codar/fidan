fidan.createSvgElement("rect", {
  x: function _(element) {
    fidan.computed(function _2() {
      element.setAttribute("x", x$.$val);
    }, x$);
  }
});
