import * as fidan from '@fidanjs/runtime';

const Component = (props) => {
	const { value, text } = props;
	console.log(text());
	return fidan.html`<span>${value}</span>`;
};
