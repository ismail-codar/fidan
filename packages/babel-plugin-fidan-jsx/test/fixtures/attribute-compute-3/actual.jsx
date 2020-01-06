<div
  aria-selected={computed(
    () => (selected() ? "selected" : ""),
    () => [selected]
  )}
/>;
