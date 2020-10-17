export const App = () => {
	let newTodo = '';
	let todos: { title: string; completed: boolean }[] = [];

	const handleInput = (e) => {
		if (e.keyCode === 13) {
			todos.push({ title: e.target.value, completed: false });
			newTodo = '';
		}
	};

	return (
		<div>
			<input onKeyDown={handleInput} value={newTodo} />
			<ul>{todos.map((todo) => <li className={todo.completed ? 'todo-completed' : ''}>{todo.title}</li>)}</ul>
		</div>
	);
};
