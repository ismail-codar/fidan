import { CountItem } from './CountItem';
import { CounterButton } from './CounterButton';

export const App = () => {
	let count = 0;

	return (
		<div>
			<CounterButton
				onClick={() => {
					count = count - 1;
				}}
				text="-"
			/>
			<CountItem value={count} />
			<CounterButton
				onClick={() => {
					count++;
				}}
				text="+"
			/>
		</div>
	);
};
