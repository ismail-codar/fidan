export const App = () => {
	let todos = [
		{
			title: 'Todo1',
			completed: false
		},
		{
			title: 'Todo2',
			completed: false
		}
	];
	todos.push({ title: 'Todo3', completed: false });

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
			<ul className={todos.length === 0 ? 'empty' : ''}>
				{todos.map((todo) => (
					<li className={'cls_' + todo.title} data-completed={todo.completed ? true : false}>
						<input type="checkbox" checked={todo.completed} onChange={() => handleComplete(todo)} />
						{todo.title}
						<a onClick={() => handleDelete(todo, index)}>X</a>
					</li>
				))}
			</ul>
		</div>
	);
};
