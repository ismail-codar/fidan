import * as fidan from '@fidanjs/runtime';

export const App = () => {
	//return <div>App</div>;
	let a = 1;

	setInterval(() => {
		a = a + 1;
	}, 1000);

	return fidan.html`<div>App: ${a}</div>`;
};
