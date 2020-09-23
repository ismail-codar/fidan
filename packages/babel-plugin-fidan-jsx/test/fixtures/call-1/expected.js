import * as fidan from '@fidanjs/runtime';

const view = () => {
	var a = fidan.value(1);
	var b = fidan.value(2);
	var c = fidan.computed(() => {
		return someFunction1(a(), b());
	});
	var d = 3;
	console.log(d);

	return fidan.html`<div>c: ${c} f: ${fidan.computed(() => {
		return someFunction2(c(), d);
	})}</div>`;
};