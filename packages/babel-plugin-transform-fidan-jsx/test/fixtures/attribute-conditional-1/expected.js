var selectedClass = fjsx.value("danger");
fidan(
  "div",
  {
    className: function(element) {
      fjsx.compute(function() {
        element.className = "none" === selectedClass.$val ? "danger" : "";
      }, selectedClass);
    }
  },
  "test"
);
