<div className="view">
  <input
    className="toggle"
    type="checkbox"
    checked={todo.completed()}
    onChange={e => {
      todo.completed(e.target.checked);
    }}
  />
  <label>{todo.title()}</label>
  <button className="destroy" onClick={e => removeTodo(todo.id)} />
</div>;
