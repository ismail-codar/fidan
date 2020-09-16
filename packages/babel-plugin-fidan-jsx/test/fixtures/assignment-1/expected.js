import * as fidan from '@fidanjs/runtime';

const view = () => {
	var a = fidan.value(1);
	var b = fidan.value(2);
	var c = fidan.computed(() => {
		return someFunction(a(), b());
	});
	var d = c;
	console.log(d());
	d(1);
	var e = d;
	console.log(e());
	e = c;

	return fidan.html`<div>c: ${c}</div>`;
};
