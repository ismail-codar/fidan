const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div><div id='div1'></div><div id='div2'></div></div>";
var Component = function Component() {
  var div1, test1;
  return (function() {
    var _el$ = _tmpl$.content.firstChild.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.nextSibling;
    div1 = _el$2;
    test1.dom = _el$3;
    return _el$;
  })();
};
