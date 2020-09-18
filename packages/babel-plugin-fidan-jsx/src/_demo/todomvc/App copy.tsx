import * as fidan from '@fidanjs/runtime';

// export const App = () => {
// 	let a = 1;

// 	setInterval(() => {
// 		a = a + 1;
// 	}, 1000);

// 	return <div>App: {a}</div>;
// };

export const App = () => {
	let a = 1;
	setInterval(() => {
		a = a + 1;
	}, 1000);

	return fidan.html`<div>App: ${a}</div>`;
};
