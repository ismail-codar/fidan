import { html, useComputed, useSubscribe } from '../../../../src';

// interface & types
type FilterType = '' | 'active' | 'completed';
interface Todo {
  id: number;
  title: string;
  editing: boolean;
  completed: boolean;
}

// variables
const STORAGE_KEY = 'fidan_todomvc';
let hashFilter = '';
let todos: Todo[] = [];
let allChecked = false;

const shownTodos = useComputed(() => {
  let _todos = todos;
  const filter = hashFilter;
  if (filter !== '') {
    _todos = _todos.filter(todo =>
      filter === 'active' ? !todo.completed : todo.completed
    ) as any;
  }
  return _todos;
});

// methods
const updateTodo = (todo: Todo, title: string) => {
  title = title.trim();
  if (title) {
    todo.title = title;
    todo.editing = false;
  } else {
    removeTodo(todo.id);
  }
};
const removeTodo = id => {
  todos.splice(
    shownTodos.findIndex(item => item.id == id),
    1
  );
};
const clearCompleted = e => {
  const removes = [];
  todos.forEach(todo => {
    if (todo.completed) removes.push(todo);
  });
  while (removes.length) todos.splice(todos.indexOf(removes.pop()), 1);
};

// css computations
const footerLinkCss = (waiting: FilterType) => () =>
  hashFilter === waiting ? 'selected' : '';

const editItemCss = (todo: Todo) => () => {
  const classes = [];
  todo.completed && classes.push('completed');
  todo.editing && classes.push('editing');
  return classes.join(' ');
};

// footer
const todoCount = useComputed(() => {
  const count = todos.filter(item => {
    return !item.completed;
  }).length;
  window.requestAnimationFrame(() => {
    if (count === 0 && !allChecked) {
      allChecked = true;
    }
    if (count && allChecked) {
      allChecked = false;
    }
  });
  return count;
});

// router
window.addEventListener('hashchange', () => {
  hashFilter = window.location.hash.substr(2) as FilterType;
});
hashFilter = window.location.hash.substr(2) as FilterType;

// storage
useSubscribe(
  useComputed(() => JSON.stringify(todos)),
  strTodos => {
    localStorage.setItem(STORAGE_KEY, strTodos);
  }
);

todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(
  (item: Todo) => {
    const todo: Todo = {
      id: item.id,
      completed: item.completed,
      editing: item.editing,
      title: item.title,
    };
    return todo;
  }
);

// view
const APP = html`
  <div>
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
        onkeypress="${e => {
          if (e.key === 'Enter') {
            const title = e.target.value.trim();
            if (title) {
              const todo = {
                id: Math.random(),
                title: title,
                editing: false,
                completed: false,
              };
              todos.push(todo);
            }
            e.target.value = '';
          }
        }}"
      />
    </header>
    ${useComputed(() => {
      if (todos.length > 0) {
        return html`
          <section class="main">
            <input
              id="toggle-all"
              class="toggle-all"
              type="checkbox"
              checked="${allChecked}"
              onclick="${e =>
                todos.forEach(todo => (todo.completed = e.target.checked))}"
            />
            <label for="toggle-all">Mark all as complete</label>
            <ul class="todo-list">
              ${shownTodos.map(
                todo => html`
                  <li
                    class="${editItemCss(todo)}"
                    ondblclick="${(e: any) => {
                      todo.editing = true;
                      e.currentTarget.lastElementChild.focus();
                    }}"
                  >
                    <div class="view">
                      <input
                        class="toggle"
                        type="checkbox"
                        onchange="${e => {
                          todo.completed = e.target.checked;
                        }}"
                        checked="${todo.completed}"
                      />
                      <label>${todo.title}</label>
                      <button
                        class="destroy"
                        onclick="${e => removeTodo(todo.id)}"
                      ></button>
                    </div>
                    <input
                      class="edit"
                      value="${todo.title}"
                      onkeypress="${e => {
                        if (e.key === 'Enter') {
                          updateTodo(todo, e.target.value);
                        }
                      }}"
                      onblur="${e => updateTodo(todo, e.target.value)}"
                    />
                  </li>
                `
              )}
            </ul>
          </section>
          <footer class="footer">
            <span class="todo-count"
              ><strong>${todoCount}</strong> item${useComputed(() =>
                todoCount > 1 ? 's' : ''
              )}
              left</span
            >
            <ul class="filters">
              <li>
                <a class="${footerLinkCss('')}" href="#/">All</a>
              </li>
              <li>
                <a class="${footerLinkCss('active')}" href="#/active">Active</a>
              </li>
              <li>
                <a class="${footerLinkCss('completed')}" href="#/completed"
                  >Completed</a
                >
              </li>
            </ul>
            ${useComputed(() => {
              if (todos.length - todoCount > 0) {
                return html`
                  <button class="clear-completed" onclick="${clearCompleted}">
                    Clear completed
                  </button>
                `;
              }
            })}
          </footer>
        `;
      }
    })}
  </div>
`;

const styleSheets = html`
  <link rel="stylesheet" href="https://unpkg.com/todomvc-common/base.css" />
  <link rel="stylesheet" href="https://unpkg.com/todomvc-app-css/index.css" />
`;
document.head.appendChild(styleSheets);
setTimeout(() => {
  document.getElementById('main').appendChild(APP);
}, 150);