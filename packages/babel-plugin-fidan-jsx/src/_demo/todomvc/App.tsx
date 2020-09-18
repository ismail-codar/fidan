const sqrt = (num: number) => {
	return num * num;
};

export const App = () => {
	let a = 1;

	setInterval(() => {
		a = a + 1;
	}, 1000);

	return (
		<div>
			Num: {a} <br />
			Sqrt: {sqrt(a)}
		</div>
	);
};
