export const App = () => {
	let todos = [
		{ title: 'Todo1' },
		{
			title: 'Todo2'
		}
	];
	todos.push({ title: 'Todo3' });

	return (
		<div>
			<ul>{todos.map((todo) => <li className={'cls_' + todo.title}>{todo.title}</li>)}</ul>
		</div>
	);
};
