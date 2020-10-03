export const App = () => {
	let todos = [ 'Todo 1', 'Todo 2', 'Todo 3' ];

	setTimeout(() => {
		todos.push('Todo 4');

		setTimeout(() => {
			const filtered = todos.filter((todo, index) => {
				return index % 2 === 0;
			});
			todos = filtered;
		}, 2000);
	}, 2000);

	return (
		<div>
			<ul>{todos.map((todo) => <li>{todo}</li>)}</ul>
		</div>
	);
};
