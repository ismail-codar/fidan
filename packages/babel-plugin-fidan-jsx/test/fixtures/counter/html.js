import * as fidan from '@fidanjs/runtime';

const CountItem = (props) => {
	const value = {
		props
	};
	return fidan.html`<span>${value}</span>`;
};

const CounterButton = ({ text, onClick }) => {
	return fidan.html`<button onclick="${onClick}">${text}</button>`;
};

export const App = () => {
	let count = 0;
	return fidan.html`<div>${CounterButton({
		onClick: () => {
			count++;
		},
		text: '+'
	})}${CountItem({
		value: count
	})}${CounterButton({
		onClick: () => {
			count = count - 1;
		},
		text: '-'
	})}</div>`;
};
