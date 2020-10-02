export const App = () => {
	const todos = [ 'Todo 1', 'Todo 2', 'Todo 3' ];

	setTimeout(() => {
		todos.push('Todo 4');
	}, 2000);

	return (
		<div>
			<ul>{todos.map((todo) => <li>{todo}</li>)}</ul>
		</div>
	);
};
