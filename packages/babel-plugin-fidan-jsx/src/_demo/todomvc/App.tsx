const sqrt = (num: number) => {
	console.log(num);
	return num * num;
};

export const App = () => {
	let a = 1;

	setInterval(() => {
		a = a + 1;
	}, 1000);

	const b = sqrt(a);

	return (
		<div>
			Num: {a} <br />
			Sqrt: {b}
		</div>
	);
};
