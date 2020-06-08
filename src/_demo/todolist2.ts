import { value } from '../f';
import { html } from '../html';

interface ITodo {
	title: string;
	completed?: boolean;
}

const todos = value([
	{
		title: 'item 1'
	},
	{
		title: 'item 2'
	},
	{
		title: 'item 3'
	}
]);

setTimeout(() => {
	const arr = todos();
	arr.push({
		title: 'item 4'
	});
	todos(arr);
}, 2000);

const app = html`
  <div>
    <ul>
    ${todos.map((todo) => html`<li>${todo.title}</li>`)}
    </ul>
  </div>
`;

document.getElementById('main').appendChild(app);
