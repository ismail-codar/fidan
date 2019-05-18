const template = (
  <div id="main">
    <button onclick={() => console.log("bound")}>Click Bound</button>
    <button onClick={() => console.log("delegated")}>Click Delegated</button>
    <button>Click Listener</button>
  </div>
);
