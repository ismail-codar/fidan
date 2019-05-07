<div className="view">
  <input
    className="toggle"
    type="checkbox"
    checked={completed()}
    onChange={e => {
      todo.completed(e.target.checked);
    }}
  />
  <label>{title()}</label>
  <button className="destroy" onClick={e => removeTodo(todo.id)} />
</div>;
