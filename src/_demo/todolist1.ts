import { html } from '../html';
import { value } from '../value';

interface ITodo {
  title: string;
  completed?: boolean;
}

const todos: ITodo[] = [
  {
    title: 'item 1',
  },
  {
    title: 'item 2',
  },
  {
    title: 'item 3',
  },
];

const app = html`
  <div>
    <ul>
      ${todos.map(todo => {
        return html`
          <li>${todo.title}</li>
        `;
      })}
    </ul>
  </div>
`;

document.getElementById('main').appendChild(app);
