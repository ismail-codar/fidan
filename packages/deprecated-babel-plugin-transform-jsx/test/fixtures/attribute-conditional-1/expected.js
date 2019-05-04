var selectedClass$ = fidan.value("danger");
fidan.createElement(
  "div",
  {
    className: function _(element) {
      fidan.compute(function _2() {
        element.className = "none" === selectedClass$.$val ? "danger" : "";
      }, selectedClass$);
    }
  },
  "test"
);
