export const CounterButton = (props: { text: string; onClick: () => void }) => {
	return <button onClick={props.onClick}>{props.text}</button>;
};
