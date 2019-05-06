const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div></div>";
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
_r$.attr(_el$, "aria-selected", true, computeSelected);
_el$;
var computeSelected = compute(
  function() {
    return selected() ? "selected" : "";
  },
  function() {
    return [selected];
  }
);
