const CountItem = props => {
  const { value } = props;
  return <span>{value}</span>;
};

const CounterButton = ({ text, onClick }) => (
  <button onClick={onClick}>{text}</button>
);

const CounterApp = () => {
  let count = 0;

  return (
    <div>
      <CounterButton text="-" onClick={() => (count = count - 1)} />
      <CountItem value={count} />
      <CounterButton text="+" onClick={() => count++} />
    </div>
  );
};

document.getElementById('main').appendChild(CounterApp() as any);
