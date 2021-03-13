import * as fidan from '@fidanjs/runtime';
import insertSyleSheet from 'insert-stylesheet';

// interface & types
type FilterType = void | '' | 'active' | 'completed';
interface Todo {
  id: number;
  title: string;
  editing: boolean;
  completed: boolean;
}

const STORAGE_KEY = 'fidan_todomvc';
let hashFilter: FilterType = '';
let todos: Todo[] = [];
let allChecked = false;

const shownTodos = (() => {
  let _todos = todos;
  const filter = hashFilter;
  if (filter !== '') {
    _todos = _todos.filter(todo =>
      filter === 'active' ? !todo.completed : todo.completed
    );
  }
  return _todos;
})();

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
    todos.findIndex(item => item.id == id),
    1
  );
};
const clearCompleted = e => {
  const removes = [];
  todos.forEach((todo: Todo) => {
    if (todo.completed) removes.push(todo);
  });
  while (removes.length) todos.splice(todos.indexOf(removes.pop()), 1);
};

const footerLinkCss = (waiting: FilterType) =>
  fidan.useComputed(() => (hashFilter === waiting ? 'selected' : ''));

const editItemCss = (todo: Todo) =>
  fidan.useComputed(() => {
    const classes = [];
    todo.completed && classes.push('completed');
    todo.editing && classes.push('editing');
    return classes.join(' ');
  });

const todoCount = fidan.useComputed(() => {
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

window.addEventListener('hashchange', () => {
  hashFilter = window.location.hash.substr(2) as FilterType;
});
hashFilter = window.location.hash.substr(2) as FilterType;

fidan.useSubscribe(
  fidan.useComputed(() => JSON.stringify(todos)),
  strTodos => {
    localStorage.setItem(STORAGE_KEY, strTodos);
  }
);

todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(item => {
  const todo = {
    id: item.id,
    completed: item.completed,
    editing: item.editing,
    title: item.title,
  };
  return todo;
});

const TodoAPP = (
  <div>
    <header className="header">
      <h1>todos</h1>
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        onKeyPress={(e: any) => {
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
        }}
      />
    </header>
    {fidan.useComputed(() => {
      if (todos.length > 0) {
        return (
          <>
            <section className="main">
              <input
                id="toggle-all"
                className="toggle-all"
                type="checkbox"
                checked={allChecked}
                onClick={(e: any) =>
                  todos.forEach(todo => (todo.completed = e.target.checked))
                }
              />
              <label htmlFor="toggle-all">Mark all as complete</label>
              <ul className="todo-list">
                {shownTodos.map(todo => (
                  <li
                    className={editItemCss(todo)}
                    onDoubleClick={(e: any) => {
                      todo.editing = true;
                      e.currentTarget.lastElementChild.focus();
                    }}
                  >
                    <div className="view">
                      <input
                        className="toggle"
                        type="checkbox"
                        onChange={e => {
                          todo.completed = e.target.checked;
                        }}
                        checked={todo.completed}
                      />
                      <label>{todo.title}</label>
                      <button
                        className="destroy"
                        onClick={e => removeTodo(todo.id)}
                      ></button>
                    </div>
                    <input
                      className="edit"
                      value={todo.title}
                      onKeyPress={(e: any) => {
                        if (e.key === 'Enter') {
                          updateTodo(todo, e.target.value);
                        }
                      }}
                      onBlur={e => updateTodo(todo, e.target.value)}
                    />
                  </li>
                ))}
              </ul>
            </section>
            <footer className="footer">
              <span className="todo-count">
                <strong>{todoCount}</strong> item
                {fidan.useComputed(() => (todoCount > 1 ? 's' : ''))}
                left
              </span>
              <ul className="filters">
                <li>
                  <a className={footerLinkCss('')} href="#/">
                    All
                  </a>
                </li>
                <li>
                  <a className={footerLinkCss('active')} href="#/active">
                    Active
                  </a>
                </li>
                <li>
                  <a className={footerLinkCss('completed')} href="#/completed">
                    Completed
                  </a>
                </li>
              </ul>
              {fidan.useComputed(() => {
                if (todos.length - todoCount > 0) {
                  return (
                    <button
                      className="clear-completed"
                      onClick={clearCompleted}
                    >
                      Clear completed
                    </button>
                  );
                }
              })}
            </footer>
          </>
        );
      }
    })}
  </div>
);

insertSyleSheet('https://unpkg.com/todomvc-common/base.css');
insertSyleSheet('https://unpkg.com/todomvc-app-css/index.css');
document.getElementById('main').appendChild(TodoAPP as any);
