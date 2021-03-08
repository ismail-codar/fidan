import * as fidan from '@fidanjs/runtime';

const CountItem = props => {
  const { value } = props;
  return fidan.html`<span>${value}</span>`;
};

const CounterButton = ({ text, onClick }) =>
  fidan.html`<button onclick="${onClick}">${text}</button>`;

const APP = () => {
  let count = fidan.observable(0);
  return fidan.html`<div>${CounterButton({
    text: fidan.observable('+'),
    onClick: () => fidan.assign(count, fidan.access(count) + 1),
  })}${CountItem({
    value: fidan.observable(count),
  })}${CounterButton({
    text: fidan.observable('-'),
    onClick: () => (count = fidan.assign(count, fidan.access(count) - 1)),
  })}</div>`;
};
