const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
compute(function _() {
  _el$.className = (function() {
    return selected() ? "selected" : "";
  })();
});
_el$;
_tmpl$.innerHTML = "<div></div>";
