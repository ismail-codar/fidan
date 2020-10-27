import * as fidan from '@fidanjs/runtime';
export const App = () => {
	let todos = fidan.value([
		{
			title: fidan.value('Todo1'),
			completed: fidan.value(false)
		},
		{
			title: fidan.value('Todo2'),
			completed: fidan.value(false)
		}
	]);

	todos.push({
		title: fidan.value('Todo3'),
		completed: fidan.value(false)
	});

	const handleDelete = (todo, index) => {
		console.log(todo.completed());
		const idx = todos.indexOf(todo);
		todos.splice(idx, 1);
	};

	const handleComplete = (todo) => {
		console.log(todo.title());
		const idx = todos.indexOf(todo);
		todos[idx].completed = !todos[idx].completed;
	};

	return fidan.html`<div><ul className="${fidan.computed(() => {
		return todos.length() === 0 ? 'empty' : '';
	})}">${todos.map(
		(todo) =>
			fidan.html`<li className="${fidan.computed(() => {
				return 'cls_' + todo.title();
			})}" data-completed="${fidan.computed(() => {
				return todo.completed() ? true : false;
			})}">
			<input type="checkbox" checked="${todo.completed}" onchange="${() => handleComplete(todo)}" />
			${todo.title}
			<a onclick="${() => handleDelete(todo, index)}">X</a>
		</li>`
	)}</ul></div>`;
};
