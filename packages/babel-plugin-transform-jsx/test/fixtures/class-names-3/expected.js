fidan.createElement("span", {
  className: function _(element) {
    fidan.compute(function _2() {
      element.className = classNames({
        arrow: true,
        asc: sortKeys$.$val[key] > 0,
        dsc: sortKeys$.$val[key] < 0
      });
    }, sortKeys$);
  }
});
