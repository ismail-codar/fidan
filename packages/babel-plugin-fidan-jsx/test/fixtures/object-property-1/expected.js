import * as fidan from '@fidanjs/runtime';

const obj1 = {
	prop1: fidan.value(1)
};

const view = fidan.html`<div>prop1: ${obj1.prop1}</div>`;
