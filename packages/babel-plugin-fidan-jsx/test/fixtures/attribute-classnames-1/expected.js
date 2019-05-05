const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
compute(function() {
  _el$.className = classNames(
    {
      editing: editing(),
      completed: completed()
    },
    highlight()
  );
});
_el$;
_tmpl$.innerHTML = "<div>test</div>";
