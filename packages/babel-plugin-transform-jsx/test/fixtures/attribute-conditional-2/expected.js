fidan.createElement(
  "div",
  {
    className: function _(element) {
      fidan.compute(function _2() {
        element.className = d.id === state.selected.$val ? "danger" : "";
      }, state.selected);
    }
  },
  "test"
);
