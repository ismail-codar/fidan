const view = () => {
	var a = fidan.value(1);
	var b = fidan.value(2);
	var c = fidan.computed(() => {
		return a() + b();
	});
	return html`<div>c: ${c}</div>`;
};
