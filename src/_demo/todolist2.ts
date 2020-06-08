import { value } from '../f';
import { html } from '../html';
import { FidanValue } from '..';

interface ITodo {
	title: FidanValue<string>;
	completed: FidanValue<boolean>;
}

const todos = value<ITodo[]>([
	{
		title: value('item 1'),
		completed: value(false)
	},
	{
		title: value('item 2'),
		completed: value(false)
	},
	{
		title: value('item 3'),
		completed: value(false)
	}
]);

setTimeout(() => {
	const arr = todos().slice(0);
	arr.push({
		title: value('item 4'),
		completed: value(false)
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
