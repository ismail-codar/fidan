import { fidan } from '@fidanjs/runtime';

const view = () => {
	var a = fidan.value(1);
	var b = 2;

	console.log(a());

	return fidan.html`<div>a: ${a}</div>`;
};
