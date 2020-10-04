export const App = () => {
	let todos = [ { title: 'Todo1' }, { title: 'Todo2' }, { title: 'Todo3' } ];
	todos.push({ title: 'Todo4' });

	return (
		<div>
			<ul>{todos.map((todo) => <li className={'cls_' + todo.title}>{todo.title}</li>)}</ul>
		</div>
	);
};
