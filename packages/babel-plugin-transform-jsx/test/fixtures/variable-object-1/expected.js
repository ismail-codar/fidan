var obj = {
  data: 1,
  value$: value$,
  amount$: fidan.initCompute(function _() {
    return value$.$val + data;
  }, value$)
};
