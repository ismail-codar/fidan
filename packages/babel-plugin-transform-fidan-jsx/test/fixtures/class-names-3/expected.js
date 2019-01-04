fidan("span", {
  className: function(element) {
    fjsx.compute(function() {
      element.className = classNames({
        arrow: true,
        asc: sortKeys$.$val[key] > 0,
        dsc: sortKeys$.$val[key] < 0
      });
    }, sortKeys$);
  }
});
