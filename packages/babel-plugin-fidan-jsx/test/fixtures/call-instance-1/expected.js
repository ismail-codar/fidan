const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true),
  _el$2 = _el$.firstChild,
  _el$3 = _el$2.nextSibling,
  _el$4 = _el$3.nextSibling;
_el$2.onchange = function(e) {
  todo.completed(e.target.checked);
};
_r$.attr(_el$2, "checked", false, todo.completed);
_r$.insert(_el$3, todo.title);
_el$4.__click = function(e) {
  return removeTodo(todo.id);
};
_el$;
_tmpl$.innerHTML =
  "<div class='view'><input class='toggle' type='checkbox'/><label></label><button class='destroy'></button></div>";
_r$.delegateEvents(["click"]);
