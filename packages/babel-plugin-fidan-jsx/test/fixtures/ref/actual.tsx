var Component = () => {
  let div1, test1;

  return (
    <div>
      <div id="div1" ref={div1} />
      <div id="div2" ref={test1.dom} />
    </div>
  );
};
