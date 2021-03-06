import { html } from '../html';
import { Observable, value } from '../value';

const CountItem = (props: { value: number }) => {
  const { value } = props;
  return html`
    <span> ${value} </span>
  `;
};

const CounterButton = (props: { text: string; onClick: () => void }) => {
  return html`
    <button onClick="${props.onClick}">${props.text}</button>
  `;
};

const CounterApp = () => {
  let count = 0;

  return html`
    <div>
      ${CounterButton({
        onClick: () => {
          count = count - 1;
        },
        text: '-',
      })}
      ${CountItem({
        value: count,
      })}
      ${CounterButton({
        onClick: () => {
          count = count++;
        },
        text: '+',
      })}
    </div>
  `;
};
