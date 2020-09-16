import { fidan } from '@fidanjs/runtime';

const view = () => {
	var a = fidan.value(1);
	var b = fidan.value(2);
	var c = fidan.computed(() => {
		return a() + b();
	});
	return fidan.html`<div>c: ${c}</div>`;
};
