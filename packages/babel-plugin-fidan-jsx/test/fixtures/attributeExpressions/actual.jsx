const welcoming = "Welcome";
const selected = true;
const color = "red";
const props = { some: "stuff", no: "thing" };

let link;

const template = (
  <div id="main" style={{ color }}>
    <h1
      {...props}
      {...results}
      title={welcoming}
      style={{ backgroundColor: color }}
    >
      <a href={"/"} ref={link}>
        Welcome
      </a>
    </h1>
  </div>
);
