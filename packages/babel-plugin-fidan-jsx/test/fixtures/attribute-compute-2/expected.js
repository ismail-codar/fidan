const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
_r$.attr(
  _el$,
  "aria-selected",
  true,
  compute(function() {
    return selected() ? "selected" : "";
  })
);
_el$;
_tmpl$.innerHTML = "<div></div>";
