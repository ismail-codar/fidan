import { compute, value } from "@fidanjs/runtime";
var _r$ = require("..");

const selected = value(false);

setInterval(() => selected(!selected() as any), 1000);

const div1 = (
  <div
    class={compute(() => {
      return selected() ? "selected" : "";
    })}
  >
    {selected}
    <hr />
    TODO: Conditional <br />
    {selected() ? "yes" : "no"} <br />
  </div>
);

document.body.appendChild(div1 as any);
