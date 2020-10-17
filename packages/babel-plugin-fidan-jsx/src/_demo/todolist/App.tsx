export const App = () => {
	let newTodo = '';
	let todos: { title: string; completed: boolean }[] = [];

	const handleInput = (e) => {
		if (e.keyCode === 13) {
			todos.push({ title: e.target.value, completed: false });
			newTodo = '';
		}
	};

	const handleDelete = (todo, index) => {
		const idx = todos.indexOf(todo);
		todos.splice(idx, 1);
	};
	const handleComplete = (todo) => {
		const idx = todos.indexOf(todo);
		todos[idx].completed = !todos[idx].completed;
	};

	return (
		<div>
			<input onKeyDown={handleInput} value={newTodo} />
			<ul>
				{todos.map((todo, index) => (
					<li className={todo.completed ? 'todo-completed' : ''}>
						<input type="checkbox" checked={todo.completed} onChange={() => handleComplete(todo)} />
						{todo.title} <a onClick={() => handleDelete(todo, index)}>X</a>
					</li>
				))}
			</ul>
		</div>
	);
};
