import * as fidan from '@fidanjs/runtime';
const APP = () => {
  let count = fidan.observable(0);
  return fidan.html`${CounterButton({
    text: fidan.observable('+'),
    onClick: () => fidan.assign(count, fidan.access(count) + 1),
  })}${CounterButton({
    text: fidan.observable('+'),
    onClick: function() {
      return fidan.assign(count, fidan.access(count) + 1);
    },
  })}${CountItem({
    value: fidan.observable(count),
  })}${CounterButton({
    text: fidan.observable('-'),
    onClick: () => (count = fidan.assign(count, fidan.access(count) - 1)),
  })}${CounterButton({
    text: fidan.observable('-'),
    onClick: function() {
      return (count = fidan.assign(count, fidan.access(count) - 1));
    },
  })}`;
};
