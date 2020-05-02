var a = 1;
var b = 2;
var tmpNumA = 0;
var tmpNumB = 0;
const handleAChange = (e) => {
	tmpNumA = Number(e.target.value);
	a = a + tmpNumA;
};
const handleBChange = (e) => {
	tmpNumB = Number(e.target.value);
	b = b + tmpNumB;
};
const max = a > b ? 'a' : 'b';
const max2 = max.toUpperCase();
const tmpNumAStr = tmpNumA + '';
var view = html`<div>
  a: ${a}<br />b: ${b}<br />a+b: ${a + b}<br />max: ${max}<br />max2: ${max2}<br /><input
    type="number"
    on-change="${handleAChange}"
  /><br /><input type="number" on-change="${handleBChange}" />tmpNumAStr:
  ${tmpNumAStr}
</div>`;
