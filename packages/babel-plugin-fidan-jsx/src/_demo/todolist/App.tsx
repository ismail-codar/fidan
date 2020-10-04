export const App = () => {
	let todos = [ { title: 'Todo1' }, { title: 'Todo2' }, { title: 'Todo3' } ];

	setTimeout(() => {
		todos.push({ title: 'Todo4' });

		setTimeout(() => {
			const filtered = todos.filter((todo, index) => {
				return index % 2 === 0;
			});
			todos = filtered;
		}, 2000);
	}, 2000);

	return (
		<div>
			<ul>{todos.map((todo) => <li className={'cls_' + todo.title}>{todo.title}</li>)}</ul>
		</div>
	);
};
