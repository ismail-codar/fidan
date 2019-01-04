fidan(
  "div",
  {
    className: function(element) {
      fjsx.compute(function() {
        element.className = d.id === state.selected.$val ? "danger" : "";
      }, state.selected);
    }
  },
  "test"
);
