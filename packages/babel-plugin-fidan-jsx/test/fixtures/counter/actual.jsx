const APP = () => {
  let count = 0;

  return (
    <>
      <CounterButton text="+" onClick={() => count++} />
      <CountItem value={count} />
      <CounterButton text="-" onClick={() => (count = count - 1)} />
    </>
  );
};