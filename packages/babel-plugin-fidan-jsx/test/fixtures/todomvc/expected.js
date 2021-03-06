import * as fidan from '@fidanjs/runtime';
const STORAGE_KEY = fidan.value('fidan_todomvc');
let hashFilter = fidan.value('');
let todos = fidan.value([]);
let allChecked = fidan.value(false);
const shownTodos = fidan.useComputed(() => {
  let _todos = fidan.value(todos);
  const filter = fidan.value(hashFilter);
  if (filter !== '') {
    fidan.assign(
      _todos,
      _todos.filter(todo =>
        filter === 'active' ? !todo.completed : todo.completed
      )
    );
  }
  return _todos;
});
const updateTodo = (todo, title) => {
  fidan.assign(title, title.trim());
  if (title) {
    fidan.assign(todo.title, title);
    fidan.assign(todo.editing, false);
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
  const removes = fidan.value([]);
  todos.forEach(todo => {
    if (todo.completed) removes.push(todo());
  });
  while (removes.length) todos.splice(todos.indexOf(removes.pop()), 1);
};
const footerLinkCss = waiting => () =>
  hashFilter === waiting ? 'selected' : '';
const editItemCss = todo => () => {
  const classes = fidan.value([]);
  todo.completed && classes.push('completed');
  todo.editing && classes.push('editing');
  return classes.join(' ');
};
const todoCount = fidan.useComputed(() => {
  const count = fidan.value(
    todos.filter(item => {
      return !item.completed;
    }).length
  );
  window.requestAnimationFrame(() => {
    if (count === 0 && !allChecked) {
      fidan.assign(allChecked, true);
    }
    if (count && allChecked) {
      fidan.assign(allChecked, false);
    }
  });
  return count;
});
window.addEventListener('hashchange', () => {
  fidan.assign(hashFilter, window.location.hash.substr(2));
});
fidan.assign(hashFilter, window.location.hash.substr(2));
fidan.useSubscribe(
  fidan.useComputed(() => JSON.stringify(todos())),
  strTodos => {
    localStorage.setItem(STORAGE_KEY(), strTodos());
  }
);
fidan.assign(
  todos,
  JSON.parse(localStorage.getItem(STORAGE_KEY()) || '[]').map(item => {
    const todo = fidan.value({
      id: item.id,
      completed: item.completed,
      editing: item.editing,
      title: item.title,
    });
    return todo;
  })
);
const APP = fidan.value(fidan.html`
  <div>
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
        onkeypress="${e => {
          if (e.key === 'Enter') {
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
              todos.push(todo());
            }
            fidan.assign(e.target.value, '');
          }
        }}"
      />
    </header>
    ${fidan.useComputed(() => {
      if (todos.length > 0) {
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
                    class="${editItemCss(todo())}"
                    ondblclick="${e => {
                      fidan.assign(todo.editing, true);
                      e.currentTarget.lastElementChild.focus();
                    }}"
                  >
                    <div class="view">
                      <input
                        class="toggle"
                        type="checkbox"
                        onchange="${e => {
                          fidan.assign(todo.completed, e.target.checked);
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
                          updateTodo(todo(), e.target.value);
                        }
                      }}"
                      onblur="${e => updateTodo(todo(), e.target.value)}"
                    />
                  </li>
                `
              )}
            </ul>
          </section>
          <footer class="footer">
            <span class="todo-count"
              ><strong>${todoCount}</strong> item${fidan.useComputed(() =>
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
            ${fidan.useComputed(() => {
              if (todos.length - todoCount > 0) {
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
`);
