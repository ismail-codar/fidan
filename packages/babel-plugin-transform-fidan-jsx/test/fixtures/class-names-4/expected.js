fidan(Component, {
  className: function(element) {
    fjsx.compute(function() {
      element.className = classNames({
        entered: props.open$.$val === true
      });
    }, props.open$);
  }
});
