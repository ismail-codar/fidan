const CountItem = props => {
  const { value } = props;
  return <span>{value}</span>;
};

const CounterButton = ({ text, onClick }) => (
  <button onclick={onClick}>{text}</button>
);

const APP = () => {
  let count = 0;

  return (
    <div>
      <CounterButton text="+" onClick={() => count++} />
      <CountItem value={count} />
      <CounterButton text="-" onClick={() => (count = count - 1)} />
    </div>
  );
};

document.getElementById('main').appendChild(APP());