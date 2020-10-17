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

	return (
		<div>
			<ul className={todos.length === 0 ? 'empty' : ''}>
				{todos.map((todo) => (
					<li className={'cls_' + todo.title} data-completed={todo.completed ? true : false}>
						{todo.title}
					</li>
				))}
			</ul>
		</div>
	);
};
