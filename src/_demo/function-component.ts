import * as fidan from '..';
import { countValue } from './function-component-util';

const CountItem = props => {
  return fidan.html`<div>CountItem-count:${
    props.count
  }<button onclick="${() => {
    props.count(props.count() + 1);
  }}">CountItem-count</button></div>`;
};

export const App = () => {
  let a = fidan.value(0);
  return fidan.html`<div>${CountItem({
    count: a,
  })}App-count: ${a}<button onclick="${() => {
    a(a() + 1);
  }}">App-count</button>
count-value: ${countValue(a(), val => {
    a(val);
  })}
</div>`;
};

document.getElementById('main').appendChild(App());
