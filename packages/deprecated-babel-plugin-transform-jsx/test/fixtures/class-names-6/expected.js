fidan.createElement(AppBar, {
  className$: fidan.initCompute(function _() {
    return classNames(classes.appBar, {
      open: open$.$val
    });
  }, open$)
});
