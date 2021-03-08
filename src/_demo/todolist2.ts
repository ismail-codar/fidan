import { observableArray } from '../array';
import { html } from '../html';
import { Observable, observable } from '../observable';
interface ITodo {
  title: Observable<string>;
  completed: Observable<boolean>;
}

const todos = observableArray(
  observable<ITodo[]>([
    {
      title: observable('item 1'),
      completed: observable(false),
    },
    {
      title: observable('item 2'),
      completed: observable(false),
    },
    {
      title: observable('item 3'),
      completed: observable(false),
    },
  ])
);

setTimeout(() => {
  const arr = todos().slice(0);
  arr.push({
    title: observable('item 4'),
    completed: observable(false),
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
