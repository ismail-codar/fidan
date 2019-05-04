var className1$ = fidan.initCompute(
  function _() {
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
