// @tracked
var editing = fjsx.value(null),
  completed = fjsx.value(false),
  highlight = fjsx.value(true);
fidan(
  "div",
  {
    className: function(element) {
      fjsx.compute(
        function() {
          element.className = classNames(
            {
              editing: editing.$val,
              completed: completed.$val
            },
            highlight.$val
          );
        },
        editing,
        completed,
        highlight
      );
    }
  },
  "test"
);
