fidan(
  "div",
  {
    className: function(element) {
      fjsx.compute(function() {
        element.className = state.selected.$val;
      }, state.selected);
    }
  },
  "test"
);
