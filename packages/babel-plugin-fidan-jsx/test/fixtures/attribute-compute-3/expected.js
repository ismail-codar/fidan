const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
_r$.attr(
  _el$,
  "aria-selected",
  true,
  computed(
    function() {
      return selected() ? "selected" : "";
    },
    function() {
      return [selected];
    }
  )
);
_el$;
_tmpl$.innerHTML = "<div></div>";
