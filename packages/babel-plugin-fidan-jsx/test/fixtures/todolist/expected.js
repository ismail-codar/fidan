import * as fidan from '@fidanjs/runtime';
export const App = () => {
	let todos = fidan.value([
		{
			title: fidan.value('Todo1')
		},
		{
			title: fidan.value('Todo2')
		},
		{
			title: fidan.value('Todo3')
		}
	]);
	todos.push({
		title: fidan.value('Todo4')
	});
	return fidan.html`<div><ul>${todos.map(
		(todo) =>
			fidan.html`<li className="${fidan.computed(() => {
				return 'cls_' + todo.title();
			})}">${todo.title}</li>`
	)}</ul></div>`;
};
