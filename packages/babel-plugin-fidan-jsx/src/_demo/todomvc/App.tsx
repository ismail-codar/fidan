export const App = () => {
	let a = 1;

	setInterval(() => {
		a = a + 1;
	}, 1000);

	return <div>App: {a}</div>;
};
