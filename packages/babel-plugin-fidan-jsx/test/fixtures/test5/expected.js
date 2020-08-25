const view = () => {
	var a = value(1);
	var b = value(2);
	var c = computed(
		() => {
			return someFunction(a(), b());
		},
		[ a, b ]
	);
	return html`<div>c: ${c}</div>`;
};
