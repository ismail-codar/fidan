fidan(AppBar, {
  className$: fjsx.initCompute(function() {
    return classNames(classes.appBar, {
      open: open$.$val
    });
  }, open$)
});
