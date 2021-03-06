const input = html`<input
  onclick="${e => todos.forEach(todo => (todo.completed = e.target.checked))}"
/>`;
