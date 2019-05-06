import { compute, value } from "@fidanjs/runtime";
var _r$ = require("..");

const selected = value(false);

const div1 = (
  <div
    class={compute(() => {
      return selected() ? "selected" : "";
    })}
  >
    <button onClick={() => selected(!selected.$val as any)}>Selected</button>
    {selected}
    <hr />
    TODO: Conditional <br />
    {selected() ? "yes" : "no"} <br />
  </div>
);

document.body.appendChild(div1 as any);
