const selected = ()=>({})
export const computeSelected = computed(
    () => (selected() ? "selected" : ""),
    () => [selected]
  );
  