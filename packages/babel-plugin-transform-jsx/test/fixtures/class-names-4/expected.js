fidan.createElement(Component, {
  className: classNames({
    entered: props.open$.$val === true
  })
});
fidan.createElement(Component_, {
  className: function _(element) {
    fidan.compute(function _2() {
      element.className = classNames({
        entered: props.open$.$val === true
      });
    }, props.open$);
  }
});
fidan.createElement("div", {
  className: function _3(element) {
    fidan.compute(function _4() {
      element.className = classNames({
        entered: props.open$.$val === true
      });
    }, props.open$);
  }
});
