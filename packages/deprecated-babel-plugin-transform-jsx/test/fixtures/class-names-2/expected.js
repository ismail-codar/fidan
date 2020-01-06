fidan.createElement(
  "div",
  {
    className: function _(element) {
      fidan.computed(
        function _2() {
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
