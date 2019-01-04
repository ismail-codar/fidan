fidan(
  "div",
  {
    className: function(element) {
      fjsx.compute(
        function() {
          element.className = classNames(
            {
              editing: data.editing.$val,
              completed: data.completed.$val
            },
            data.highlight.$val
          );
        },
        data.editing,
        data.completed,
        data.highlight
      );
    }
  },
  "test"
);
