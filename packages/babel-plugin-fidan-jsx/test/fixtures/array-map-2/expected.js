const _tmpl$2 = document.createElement("template");
_tmpl$2.innerHTML = "<li></li>";
const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true),
  _el$2 = _el$.firstChild,
  _el$3 = _el$2.nextSibling;
_r$.arrayMap(
  _el$,
  data,
  function(item) {
    return (function() {
      var _el$4 = _tmpl$2.content.firstChild.cloneNode(true);
      _r$.insert(_el$4, item);
      return _el$4;
    })();
  },
  _el$3
);
_el$;
_tmpl$.innerHTML = "<ul>start<!--3-->end</ul>";
