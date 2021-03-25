import * as fidan from '@fidanjs/runtime';
const Component = (props, children) => {
  return fidan.html`<li id="${props.name}">${children}</li>`;
};
const LiComponent1 = _props =>
  fidan.html`<li __style="${{
    color: fidan.observable('red'),
  }}" onclick="${() => alert(1)}" __spread="${_props}">${_props.children}</li>`;
const LiComponent2 = (_props, children) =>
  fidan.html`${Component({ ..._props }, fidan.html`${children}`)}`;
