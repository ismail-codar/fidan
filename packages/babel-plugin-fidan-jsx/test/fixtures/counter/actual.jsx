const CountItem = (props) => {
	const { value } = props;
	console.log(value);
	return <span>{value}</span>;
};

const CounterButton = ({ text, onClick }) => {
	return <button onClick={onClick}>{text}</button>;
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
