import * as fidan from '@fidanjs/runtime';
export const createOverrides1 = defaultComponent => {
  return {
    Label1: fidan.observable(defaultComponent),
    labelProps1: null,
  };
};
export const createOverrides2 = defaultComponent => {
  return [defaultComponent, null];
};
const { Label1, labelProps1 } = fidan.computed(() => {
  const { Label1, labelProps1 } = createOverrides1(
    _props => fidan.html`<li __spread="${_props}">${_props.children}</li>`
  );
  return {
    Label1: fidan.observable(Label1),
    labelProps1: fidan.observable(labelProps1),
  };
});
const [Label2, labelProps2] = fidan.computed(() => {
  const [Label2, labelProps2] = createOverrides2(
    _props => fidan.html`<li __spread="${_props}">${_props.children}</li>`
  );
  return [fidan.observable(Label2), fidan.observable(labelProps2)];
});
const element = fidan.html`<ul>${Label1(
  { ...labelProps1 },
  fidan.html`Label1`
)}${Label2({ ...labelProps1 }, fidan.html`Label2`)}</ul>`;
