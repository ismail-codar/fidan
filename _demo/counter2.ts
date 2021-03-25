import * as fidan from '../src';

const CountItem = props => {
  let { value, value_$ } = props;
  value_$.subscribe(val => {
    value = val;
  });
  value_$.subscribe(val => {
    console.log(value);
  });
  return fidan.html`<span>${value_$}</span>`;
};
const CounterButton = ({ text, onClick }) => {
  return fidan.html`<button onclick="${onClick}">${text}</button>`;
};
export const App = () => {
  let count = 0;
  const count_$ = fidan.observable(count).subscribe(val => (count = val));
  return fidan.html`<div>${CounterButton({
    onClick: () => {
      count_$(count_$() + 1);
    },
    text: '+',
  })}${CountItem({
    value: count,
    value_$: count_$,
  })}${CounterButton({
    onClick: () => {
      count_$(count_$() - 1);
    },
    text: '-',
  })}</div>`;
};
document.getElementById('main').appendChild(App());
