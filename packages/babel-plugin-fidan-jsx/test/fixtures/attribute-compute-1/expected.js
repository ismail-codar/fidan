const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
compute(() => {
  _el$.className = selected() ? "selected" : "";
});
_tmpl$.innerHTML = "<div></div>";
