var obj = {
  data: 1,
  value$: value$,
  amount$: fjsx.initCompute(function() {
    return value$.$val + data;
  }, value$)
};
