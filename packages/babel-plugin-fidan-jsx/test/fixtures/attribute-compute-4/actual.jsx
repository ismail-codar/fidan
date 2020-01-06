const computeSelected = computed(
  () => (selected() ? "selected" : ""),
  () => [selected]
);

<div aria-selected={computeSelected} />;
