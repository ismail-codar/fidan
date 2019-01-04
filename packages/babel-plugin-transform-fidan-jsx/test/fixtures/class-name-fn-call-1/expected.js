fidan(
  "button",
  {
    className: function(element) {
      fjsx.compute(function() {
        element.className = cssRule({
          fontSize: "".concat(primary$.$val, "pt"),
          textAlign: "center",
          padding: "5px 10px",
          background: primary$.$val ? "green" : "blue",
          borderRadius: 5,
          ":hover": {
            background: primary$.$val ? "chartreuse" : "dodgerblue",
            boxShadow: "0 0 2px rgb(70, 70, 70)"
          }
        });
      }, primary$);
    }
  },
  "button 1"
);
