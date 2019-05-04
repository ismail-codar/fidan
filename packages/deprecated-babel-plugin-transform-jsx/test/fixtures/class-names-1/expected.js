var editing$ = fidan.value(null),
  completed$ = fidan.value(false),
  highlight$ = fidan.value(true);
fidan.createElement(
  "div",
  {
    className: function _(element) {
      fidan.compute(
        function _2() {
          element.className = classNames(
            {
              editing: editing$.$val,
              completed: completed$.$val
            },
            highlight$.$val
          );
        },
        editing$,
        completed$,
        highlight$
      );
    }
  },
  "test"
);
