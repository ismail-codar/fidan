var width$ = fidan.value(200);
fidan.createElement(
  "div",
  {
    style: {
      color: "red",
      width: function _(element) {
        fidan.computed(function _2() {
          element.style.width = width$.$val;
        }, width$);
      }
    }
  },
  "test"
);
