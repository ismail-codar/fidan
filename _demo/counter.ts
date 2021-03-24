import * as fidan from '../src';

const rr$ = fidan.reactiveRuntime();

const CountItem = props => {
  rr$.beginScope();
  const { value } = props;
  rr$.initVariable('value', value);
  rr$.callFunction(console.log, rr$.getVariable('value'));
  return rr$.endScope(fidan.html`<span>${rr$.getVariable('value')}</span>`);
};
rr$.initVariable('CountItem', CountItem);

const CounterButton = ({ text, onClick }) => {
  rr$.beginScope();
  return rr$.endScope(
    fidan.html`<button onclick="${onClick}">${rr$.getVariable('text')}</button>`
  );
};
rr$.initVariable('CounterButton', CounterButton);

export const App = () => {
  rr$.beginScope();
  let count = 0;
  rr$.initVariable('count', 0);
  const history: {
    time: Date;
    value: number;
  }[] = [];
  rr$.initVariable('history', history);
  return rr$.endScope(
    fidan.html`<div>${rr$.callFunction(CounterButton, {
      onClick: () => {
        rr$.beginScope();
        count = count + 1;
        rr$.updateVariable('count', count);
        rr$.callFunction(history.push, {
          time: new Date(),
          value: rr$.getVariable('count'),
        });
        rr$.endScope();
      },
      text: '+',
    })}${rr$.callFunction(CountItem, {
      value: rr$.getVariable('count'),
    })}${rr$.callFunction(CounterButton, {
      onClick: () => {
        rr$.beginScope();
        count = count - 1;
        rr$.updateVariable('count', count);
        rr$.endScope();
      },
      text: '-',
    })}
    <hr/>
    <ul>
    ${history.map(
      item => fidan.html`<li>${item.time.toString()}-${item.value}</li>`
    )}
    </ul>
    </div>`
  );
};

document.getElementById('main').appendChild(App());
