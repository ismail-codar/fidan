var width = fjsx.value(200);
fidan(
  "div",
  {
    style: {
      color: "red",
      width: function(element) {
        fjsx.compute(function() {
          element.style.width = width.$val;
        }, width);
      }
    }
  },
  "test"
);
