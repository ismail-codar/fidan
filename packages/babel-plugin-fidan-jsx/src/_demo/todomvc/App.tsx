const CountItem = (props: { value: number }) => {
	const value = { props };
	return <span>{value}</span>;
};

const CounterButton = (props: { text: string; onClick: () => void }) => {
	return <button onClick={props.onClick}>{props.text}</button>;
};

export const App = () => {
	let count = 0;

	return (
		<div>
			<CounterButton
				onClick={() => {
					count++;
				}}
				text="+"
			/>
			<CountItem value={count} />
			<CounterButton
				onClick={() => {
					count = count - 1;
				}}
				text="-"
			/>
		</div>
	);
};
