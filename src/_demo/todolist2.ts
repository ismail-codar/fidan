import { value } from '../f';
import { html } from '../html';

interface ITodo {
	title: string;
	completed?: boolean;
}

const todos = value([
	{
		title: value('item 1')
	},
	{
		title: value('item 2')
	},
	{
		title: value('item 3')
	}
]);

setTimeout(() => {
	const arr = todos().slice(0);
	arr.push({
		title: value('item 4')
	});
	todos(arr);

	setTimeout(() => {
		todos()[1].title('item 2 x');
	}, 1000);
}, 1000);

const app = html`
  <div>
    <ul>
    ${todos.map((todo) => html`<li>${todo.title}</li>`)}
    </ul>
  </div>
`;

document.getElementById('main').appendChild(app);
