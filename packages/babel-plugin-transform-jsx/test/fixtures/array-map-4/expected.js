fidan.createElement(
  "tr",
  null,
  gridColumns.map(function(col) {
    return fidan.createElement(
      "th",
      {
        className: function _(element) {
          fidan.compute(function _2() {
            element.className = classNames({
              active: sortKey$.$val == col
            });
          }, sortKey$);
        },
        onClick: function onClick() {
          return sortBy(filteredData$.$val, col);
        }
      },
      fidan.createElement("span", null, col)
    );
  })
);
