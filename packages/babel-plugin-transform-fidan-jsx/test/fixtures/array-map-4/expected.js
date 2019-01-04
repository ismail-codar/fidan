fidan(
  "tr",
  null,
  gridColumns.map(function(col) {
    return fidan(
      "th",
      {
        className: function(element) {
          fjsx.compute(function() {
            element.className = classNames({
              active: sortKey$.$val == col
            });
          }, sortKey$);
        },
        onClick: function onClick() {
          return sortBy(filteredData$.$val, col);
        }
      },
      fidan("span", null, col)
    );
  })
);
