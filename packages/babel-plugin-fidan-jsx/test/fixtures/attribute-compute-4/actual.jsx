const computeSelected = compute(
  () => (selected() ? "selected" : ""),
  () => [selected]
);

<div aria-selected={computeSelected} />;
