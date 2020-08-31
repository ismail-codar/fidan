const view = () => {
	var a = fidan.value(1);
	var b = fidan.value(2);
	var c = fidan.computed(() => {
		return someFunction(a(), b());
	});
	var d = 3;
	console.log(d);

	return html`<div>c: ${c}</div>`;
};
