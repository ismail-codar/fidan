const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div><!--2--><br/></div>";
var div1 = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true),
    _el$2 = _el$.firstChild;
  _r$.conditional(
    _el$,
    {
      test: function test() {
        return selected();
      },
      consequent: "yes",
      alternate: "no"
    },
    null,
    _el$2
  );
  return _el$;
})();
