const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<!--2-->";
var Main = function Main() {
  return (function() {
    var _el$ = _tmpl$.content.cloneNode(true),
      _el$2 = _el$.firstChild;
    _r$.conditional(
      _el$,
      {
        test: a.computed(function() {
          return size() > 0;
        }),
        consequent: "More",
        alternate: "One"
      },
      null,
      _el$2
    );
    return _el$;
  })();
};
