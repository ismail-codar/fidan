import * as fidan from '@fidanjs/runtime';

const CountItem = props => {
  const { value } = props;
  console.log(value());
  return fidan.html`<span>${value}</span>`;
};
const CounterButton = ({ text, onClick }) => {
  return fidan.html`<button onclick="${onClick}">${text}</button>`;
};
export const App = () => {
  let count = fidan.value(0);
  return fidan.html`<div>${CounterButton({
    onClick: () => {
      count(count() + 1);
    },
    text: fidan.value('+'),
  })}${CountItem({
    value: count,
  })}${CounterButton({
    onClick: () => {
      count(count() - 1);
    },
    text: fidan.value('-'),
  })}</div>`;
};
