var width = fjsx.value(500);
fidan(
  "div",
  {
    style: {
      color: "red",
      width: function(element) {
        fjsx.compute(function() {
          element.style.width = width.$val < 200 ? width.$val : 200;
        }, width);
      }
    }
  },
  "test"
);
