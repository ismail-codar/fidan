const _tmpl$2 = document.createElement("template");
_tmpl$2.innerHTML = "<li></li>";
const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<ul></ul>";
var data = value([]);
var template = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true);
  _r$.spread(
    _el$,
    jsx1.jsxArrayMap(
      data,
      function(item) {
        return (function() {
          var _el$2 = _tmpl$2.content.firstChild.cloneNode(true);
          _r$.insert(_el$2, item);
          return _el$2;
        })();
      },
      "reconcile"
    )
  );
  return _el$;
})();
