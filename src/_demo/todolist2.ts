import { observableArray } from '../array';
import { html } from '../html';
import { Observable, trkl } from '../trkl';
interface ITodo {
  title: Observable<string>;
  completed: Observable<boolean>;
}

const todos = observableArray(
  trkl<ITodo[]>([
    {
      title: trkl('item 1'),
      completed: trkl(false),
    },
    {
      title: trkl('item 2'),
      completed: trkl(false),
    },
    {
      title: trkl('item 3'),
      completed: trkl(false),
    },
  ])
);

setTimeout(() => {
  const arr = todos().slice(0);
  arr.push({
    title: trkl('item 4'),
    completed: trkl(false),
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
