const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
_r$.attr(
  _el$,
  "className",
  false,
  compute(function() {
    return classNames(
      {
        editing: editing(),
        completed: completed()
      },
      highlight()
    );
  })
);
_el$;
_tmpl$.innerHTML = "<div>test</div>";
