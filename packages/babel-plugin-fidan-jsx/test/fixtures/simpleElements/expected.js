const _tmpl$ = document.createElement("template");

_tmpl$.innerHTML =
  "<div id='main'><h1>Welcome</h1><label>Edit:</label><input id='entry' type='text'/></div>";

var template = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true),
    _el$2 = _el$.firstChild,
    _el$3 = _el$2.nextSibling;

  _el$3.htmlFor = "entry";
  return _el$;
})();
