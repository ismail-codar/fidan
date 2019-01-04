var className1$ = fjsx.initCompute(
  function() {
    return classNames({
      shrink: shrink$.$val,
      formControl: !focused$.$val
    });
  },
  shrink$,
  focused$
);
var className2$ = classNames({
  shrink: true
});
