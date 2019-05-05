const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
compute(
  function _() {
    _el$.setAttribute(
      "aria-selected",
      (function() {
        return selected() ? "selected" : "";
      })()
    );
  },
  function() {
    return [selected];
  }
);
_el$;
_tmpl$.innerHTML = "<div></div>";
