import * as fidan from '../src';

const App = () => {
  const backgroundColor = fidan.observable('white');
  const color = fidan.computed(() =>
    backgroundColor() == 'white' ? 'red' : 'yellow'
  );

  const changeBg = () => {
    backgroundColor(backgroundColor() === 'white' ? 'black' : 'white');
  };
  return fidan.html`<button __style="${{
    color,
    backgroundColor,
    padding: '20px',
  }}" onclick="${changeBg}">Click</button>`;
};

document.getElementById('main').appendChild(App());
