import { html } from '../html';
import { render } from '../render';
import { createRuntime } from '../runtime';

const _r_r = createRuntime();
var a = 1;
_r_r.init('a', 1);
var b = 2;
_r_r.init('b', 1);
var tmpNumA = 0;
_r_r.init('tmpNumA', 1);
var tmpNumB = 0;
_r_r.init('tmpNumB', 1);

const handleAChange = (e) => {
	tmpNumA = Number(e.target.value);
	_r_r.set('tmpNumA', tmpNumA);
	a = a + tmpNumA;
	_r_r.set('a', a);
};

const handleBChange = (e) => {
	tmpNumB = Number(e.target.value);
	_r_r.set('tmpNumB', tmpNumB);
	b = b + tmpNumB;
	_r_r.set('b', b);
};

const max = a > b ? 'a' : 'b';
_r_r.init('max', max, [ a, b ]);
const max2 = max.toUpperCase();
_r_r.init('max2', max2, [ max ]);
const tmpNumAStr = '-' + tmpNumA + '-';
_r_r.init('tmpNumAStr', tmpNumAStr, [ tmpNumA ]);

var view = html`<div>
  a: ${a}<br />b: ${b}<br />a+b: ${a + b}<br />max: ${max}<br />max2: ${max2}<br />
  <input
    type="number" value="${a}" name="a"
    onchange="${handleAChange}"
  /><br /><input type="number" value="0" onchange="${handleBChange}" />tmpNumAStr:
  ${tmpNumAStr}
</div>`;

render(document.body, view, _r_r);
