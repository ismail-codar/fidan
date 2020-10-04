export const App = () => {
	let todos = [ { title: 'Todo1' } ];
	todos.push({ title: 'Todo2' });

	return (
		<div>
			<ul>{todos.map((todo) => <li className={'cls_' + todo.title}>{todo.title}</li>)}</ul>
		</div>
	);
};
