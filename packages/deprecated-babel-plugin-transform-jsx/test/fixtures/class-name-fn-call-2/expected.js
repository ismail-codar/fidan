fidan.createElement("input", {
  className: function _(element) {
    fidan.compute(function _2() {
      element.className = classNames({
        input: true,
        disabled: props.disabled$.$val
      });
    }, props.disabled$);
  }
});
