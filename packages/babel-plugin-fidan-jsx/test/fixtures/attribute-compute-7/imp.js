const selected = ()=>({})
export const computeSelected = compute(
    () => (selected() ? "selected" : ""),
    () => [selected]
  );
  