import * as fidan from '../src';

const rr$ = fidan.reactiveRuntime();
rr$.initScope(null, '0');

const CountItem = props => {
  rr$.initScope('0', '1');
  const { value } = props;
  rr$.initVariable('1', 'value', value);
  rr$.callFunction('1', console.log, rr$.getVariable('1', 'value'));
  return fidan.html`<span>${rr$.getVariable('1', 'value')}</span>`;
};
rr$.initVariable('0', 'CountItem', CountItem);

const CounterButton = ({ text, onClick }) => {
  rr$.initScope('0', '2');
  rr$.initVariable('2', 'text', text);
  rr$.initVariable('2', 'onClick', onClick);
  return fidan.html`<button onclick="${onClick}">${rr$.getVariable(
    '2',
    'text'
  )}</button>`;
};
rr$.initVariable('0', 'CounterButton', CounterButton);

export const App = () => {
  rr$.initScope('0', '3');
  let count = 0;
  rr$.initVariable('3', 'count', 0);
  const history: {
    time: Date;
    value: number;
  }[] = [];
  rr$.initVariable('3', 'history', history);
  return fidan.html`<div>${rr$.callFunction('3', CounterButton, {
    onClick: () => {
      rr$.initScope('3', '4');
      count = count + 1;
      rr$.updateVariable('4', 'count', count);
      // rr$.callFunction('4', history.push, {
      //   time: new Date(),
      //   value: rr$.getVariable('4', 'count'),
      // });
    },
    text: '+',
  })}${rr$.callFunction('3', CountItem, {
    value: rr$.getVariable('3', 'count'),
  })}${rr$.callFunction('3', CounterButton, {
    onClick: () => {
      rr$.initScope('3', '5');
      count = count - 1;
      rr$.updateVariable('5', 'count', count);
    },
    text: '-',
  })}
    <hr/>
    <ul>

    </ul>
    </div>`;
};

document.getElementById('main').appendChild(App());
