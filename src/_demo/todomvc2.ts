import * as fidan from '..';

// interface & types
type FilterType = '' | 'active' | 'completed';
interface Todo {
  id: number;
  title: fidan.Observable<string>;
  editing: fidan.Observable<boolean>;
  completed: fidan.Observable<boolean>;
}

const STORAGE_KEY = fidan.value('fidan_todomvc');
let hashFilter = fidan.value('');
let todos = fidan.value([]);
let allChecked = fidan.value(false);
const shownTodos = fidan.computed(() => {
  let _todos = fidan.value(todos);
  const filter = fidan.value(hashFilter);
  if (fidan.arg(filter) !== '') {
    _todos = fidan.assign(
      _todos,
      _todos.filter(todo =>
        fidan.arg(filter) === 'active' ? !todo.completed : todo.completed
      )
    );
  }
  return _todos;
});
const updateTodo = (todo, title) => {
  title = fidan.assign(title, title.trim());
  if (title) {
    todo.title = fidan.assign(todo.title, title);
    todo.editing = fidan.assign(todo.editing, false);
  } else {
    removeTodo(fidan.arg(todo.id));
  }
};
const removeTodo = id => {
  todos.splice(
    fidan.arg(
      shownTodos.findIndex(item => fidan.arg(item.id) == fidan.arg(id))
    ),
    1
  );
};
const clearCompleted = e => {
  const removes = fidan.value([]);
  todos.forEach(todo => {
    if (todo.completed) removes.push(fidan.arg(todo));
  });
  while (removes.length)
    todos.splice(fidan.arg(todos.indexOf(fidan.arg(removes.pop()))), 1);
};
const footerLinkCss = waiting =>
  fidan.computed(() =>
    fidan.arg(hashFilter) === fidan.arg(waiting) ? 'selected' : ''
  );
const editItemCss = todo =>
  fidan.computed(() => {
    const classes = fidan.value([]);
    fidan.arg(todo.completed) && fidan.arg(classes.push('completed'));
    fidan.arg(todo.editing) && fidan.arg(classes.push('editing'));
    return classes.join(' ');
  });
const todoCount = fidan.useComputed(() => {
  const count = fidan.value(
    todos.filter(item => {
      return !fidan.arg(item.completed);
    }).length
  );
  window.requestAnimationFrame(() => {
    if (
      fidan.arg(fidan.arg(count) === 0) &&
      fidan.arg(!fidan.arg(allChecked))
    ) {
      allChecked = fidan.assign(allChecked, true);
    }
    if (fidan.arg(count) && fidan.arg(allChecked)) {
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
  fidan.useComputed(() => JSON.stringify(fidan.arg(todos))),
  strTodos => {
    localStorage.setItem(fidan.arg(STORAGE_KEY), fidan.arg(strTodos));
  }
);
todos = fidan.assign(
  todos,
  JSON.parse(
    fidan.arg(localStorage.getItem(fidan.arg(STORAGE_KEY)) || '[]')
  ).map(item => {
    const todo = fidan.value({
      id: item.id,
      completed: item.completed,
      editing: item.editing,
      title: item.title,
    });
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
          if (fidan.arg(e.key) === 'Enter') {
            const title = fidan.computed(() => {
              return e.target.value.trim();
            });
            if (title) {
              const todo = fidan.value({
                id: Math.random(),
                title: title,
                editing: fidan.value(false),
                completed: fidan.value(false),
              });
              todos.push(fidan.arg(todo));
            }
            e.target.value = fidan.assign(e.target.value, '');
          }
        }}"
      />
    </header>
    ${fidan.useComputed(() => {
      if (fidan.arg(todos.length) > 0) {
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
                    class="${editItemCss(fidan.arg(todo))}"
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
                        onclick="${e => removeTodo(fidan.arg(todo.id))}"
                      ></button>
                    </div>
                    <input
                      class="edit"
                      value="${todo.title}"
                      onkeypress="${e => {
                        if (fidan.arg(e.key) === 'Enter') {
                          updateTodo(
                            fidan.arg(todo),
                            fidan.arg(e.target.value)
                          );
                        }
                      }}"
                      onblur="${e =>
                        updateTodo(fidan.arg(todo), fidan.arg(e.target.value))}"
                    />
                  </li>
                `
              )}
            </ul>
          </section>
          <footer class="footer">
            <span class="todo-count"
              ><strong>${todoCount}</strong> item${fidan.useComputed(() =>
          fidan.arg(todoCount) > 1 ? 's' : ''
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
                fidan.arg(fidan.arg(todos.length) - fidan.arg(todoCount)) > 0
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
