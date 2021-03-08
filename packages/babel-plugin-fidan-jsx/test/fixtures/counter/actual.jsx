const APP = () => {
  let count = 0;

  return (
    <>
      <CounterButton text="+" onClick={() => count++} />
      <CounterButton text="+" onClick={function () {
        return count++
      }} />
      <CountItem value={count} />
      <CounterButton text="-" onClick={() => (count = count - 1)} />
      <CounterButton text="-" onClick={function () {
        return count = count - 1
      }} />
    </>
  );
};