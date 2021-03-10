import * as fidan from '../src';

// interface & types
type FilterType = '' | 'active' | 'completed';
interface Todo {
  id: number;
  title: fidan.Observable<string>;
  editing: fidan.Observable<boolean>;
  completed: fidan.Observable<boolean>;
}

const STORAGE_KEY = fidan.observable('fidan_todomvc');
let hashFilter = fidan.observable('');
let todos = fidan.observable([]);
let allChecked = fidan.observable(false);
const shownTodos = fidan.computed(() => {
  let _todos = fidan.access(todos);
  const filter = fidan.access(hashFilter);
  if (fidan.access(filter) !== '') {
    _todos = fidan.assign(
      _todos,
      _todos.filter(todo =>
        fidan.access(filter) === 'active'
          ? !fidan.access(todo.completed)
          : fidan.access(todo.completed)
      )
    );
  }
  return _todos;
});
const updateTodo = (todo, title) => {
  title = fidan.assign(title, title.trim());
  if (fidan.access(title)) {
    todo.title = fidan.assign(todo.title, title);
    todo.editing = fidan.assign(todo.editing, false);
  } else {
    removeTodo(fidan.access(todo.id));
  }
};
const removeTodo = id => {
  todos.splice(
    fidan.access(
      todos.findIndex(item => fidan.access(item.id) == fidan.access(id))
    ),
    1
  );
};
const clearCompleted = e => {
  const removes = fidan.observable([]);
  todos.forEach(todo => {
    if (fidan.access(todo.completed)) removes.push(fidan.access(todo));
  });
  while (removes.length)
    todos.splice(fidan.access(todos.indexOf(fidan.access(removes.pop()))), 1);
};
const footerLinkCss = waiting =>
  fidan.computed(() =>
    fidan.access(hashFilter) === fidan.access(waiting) ? 'selected' : ''
  );
const editItemCss = todo =>
  fidan.computed(() => {
    const classes = fidan.access([]);
    fidan.access(todo.completed) && fidan.access(classes.push('completed'));
    fidan.access(todo.editing) && fidan.access(classes.push('editing'));
    return classes.join(' ');
  });
const todoCount = fidan.useComputed(() => {
  const count = fidan.access(
    todos.filter(item => {
      return !fidan.access(item.completed);
    }).length
  );
  window.requestAnimationFrame(() => {
    if (
      fidan.access(fidan.access(count) === 0) &&
      fidan.access(!fidan.access(allChecked))
    ) {
      allChecked = fidan.assign(allChecked, true);
    }
    if (fidan.access(count) && fidan.access(allChecked)) {
      allChecked = fidan.assign(allChecked, false);
    }
  });
  return count;
});
window.addEventListener('hashchange', () => {
  hashFilter = fidan.assign(hashFilter, window.location.hash.substr(2));
});
hashFilter = fidan.assign(hashFilter, window.location.hash.substr(2));
fidan.useSubscribe(
  fidan.useComputed(() => JSON.stringify(fidan.access(todos))),
  strTodos => {
    localStorage.setItem(fidan.access(STORAGE_KEY), fidan.access(strTodos));
  }
);
todos = fidan.assign(
  todos,
  JSON.parse(
    fidan.access(localStorage.getItem(fidan.access(STORAGE_KEY)) || '[]')
  ).map(item => {
    const todo = {
      id: fidan.observable(item.id),
      completed: fidan.observable(item.completed),
      editing: fidan.observable(item.editing),
      title: fidan.observable(item.title),
    };
    return todo;
  })
);
const APP = fidan.html`
  <div>
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
        onkeypress="${e => {
          if (fidan.access(e.key) === 'Enter') {
            const title = fidan.computed(() => {
              return e.target.value.trim();
            });
            if (fidan.access(title)) {
              const todo = {
                id: fidan.observable(Math.random()),
                title: fidan.observable(title),
                editing: fidan.observable(false),
                completed: fidan.observable(false),
              };
              todos.push(fidan.access(todo));
            }
            e.target.value = fidan.assign(e.target.value, '');
          }
        }}"
      />
    </header>
    ${fidan.useComputed(() => {
      if (fidan.access(todos.length) > 0) {
        return fidan.html`
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
                todo => fidan.html`
                  <li
                    class="${editItemCss(fidan.access(todo))}"
                    ondblclick="${e => {
                      todo.editing = fidan.assign(todo.editing, true);
                      e.currentTarget.lastElementChild.focus();
                    }}"
                  >
                    <div class="view">
                      <input
                        class="toggle"
                        type="checkbox"
                        onchange="${e => {
                          todo.completed = fidan.assign(
                            todo.completed,
                            e.target.checked
                          );
                        }}"
                        checked="${todo.completed}"
                      />
                      <label>${todo.title}</label>
                      <button
                        class="destroy"
                        onclick="${e => removeTodo(fidan.access(todo.id))}"
                      ></button>
                    </div>
                    <input
                      class="edit"
                      value="${todo.title}"
                      onkeypress="${e => {
                        if (fidan.access(e.key) === 'Enter') {
                          updateTodo(
                            fidan.access(todo),
                            fidan.access(e.target.value)
                          );
                        }
                      }}"
                      onblur="${e =>
                        updateTodo(
                          fidan.access(todo),
                          fidan.access(e.target.value)
                        )}"
                    />
                  </li>
                `
              )}
            </ul>
          </section>
          <footer class="footer">
            <span class="todo-count"
              ><strong>${todoCount}</strong> item${fidan.useComputed(() =>
          fidan.access(todoCount) > 1 ? 's' : ''
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
            ${fidan.useComputed(() => {
              if (
                fidan.access(
                  fidan.access(todos.length) - fidan.access(todoCount)
                ) > 0
              ) {
                return fidan.html`
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

const styleSheets = fidan.html`
  <link rel="stylesheet" href="https://unpkg.com/todomvc-common/base.css" />
  <link rel="stylesheet" href="https://unpkg.com/todomvc-app-css/index.css" />
`;
document.head.appendChild(styleSheets);
setTimeout(() => {
  document.getElementById('main').appendChild(APP);
}, 150);
