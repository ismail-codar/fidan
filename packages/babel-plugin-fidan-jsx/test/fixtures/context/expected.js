import * as fidan from '@fidanjs/runtime';

const Copmponet = () => {
  return fidan.html`<div><i>0</i>${fidan.Context(
    {
      key: fidan.observable('theme'),
      value: fidan.observable('tema1'),
    },
    fidan.html`<span>1</span>${Component1({})}<strong>2</strong>`
  )}<b>3</b></div>`;
};
