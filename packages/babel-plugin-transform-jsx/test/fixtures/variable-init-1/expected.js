var counter$ = fidan.value(0);
var a = 0;
var x$ = fidan.value(a + 1);
var y$ = fidan.initCompute(function _() {
  return x$.$val + 1;
}, x$);
var a$ = fidan.value(null);
var b$ = fidan.value(null);
fidan.createElement(
  "button",
  {
    onClick: function onClick() {
      return counter$(counter$.$val + 1);
    }
  },
  " + "
);
