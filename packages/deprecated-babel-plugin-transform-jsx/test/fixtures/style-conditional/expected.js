var width$ = fidan.value(500);
fidan.createElement(
  "div",
  {
    style: {
      color: "red",
      width: function _(element) {
        fidan.compute(function _2() {
          element.style.width = width$.$val < 200 ? width$.$val : 200;
        }, width$);
      }
    }
  },
  "test"
);
