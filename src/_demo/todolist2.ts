import { observableArray } from '../array';
import { html } from '../html';
import { Observable, frvl } from '../frvl';
interface ITodo {
  title: Observable<string>;
  completed: Observable<boolean>;
}

const todos = observableArray(
  frvl<ITodo[]>([
    {
      title: frvl('item 1'),
      completed: frvl(false),
    },
    {
      title: frvl('item 2'),
      completed: frvl(false),
    },
    {
      title: frvl('item 3'),
      completed: frvl(false),
    },
  ])
);

setTimeout(() => {
  const arr = todos().slice(0);
  arr.push({
    title: frvl('item 4'),
    completed: frvl(false),
  });
  todos(arr);

  setTimeout(() => {
    todos()[1].title('item 2 x');
  }, 1000);
}, 1000);

const app = html`
  <div>
    <ul>
      ${todos.map(
        todo =>
          html`
            <li>${todo.title}</li>
          `
      )}
    </ul>
  </div>
`;

document.getElementById('main').appendChild(app);
