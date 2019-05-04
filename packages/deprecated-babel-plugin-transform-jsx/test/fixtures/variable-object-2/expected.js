var obj$ = fidan.initCompute(function _() {
  return {
    data: 1,
    value$: value$,
    valueX: value$.$val,
    amount$: fidan.initCompute(function _2() {
      return value$.$val + data;
    }, value$)
  };
}, value$);
