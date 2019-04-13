fidan.createElement(
  "div",
  {
    className: function _(element) {
      fidan.compute(function _2() {
        element.className = state.selected.$val;
      }, state.selected);
    }
  },
  "test"
);
