const view = () => {
	var a = fidan.value(1);
	var b = 2;

	console.log(a.$val);

	return html`<div>a: ${a}</div>`;
};
