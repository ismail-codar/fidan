const _tmpl$2 = document.createElement("template");
_tmpl$2.innerHTML = "<div>First</div><!--4--><div>Last</div>";
const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div>First</div><div>Last</div>";
var inserted = "middle";
var multiStatic = _tmpl$.content.cloneNode(true);
var multiExpression = (function() {
  var _el$2 = _tmpl$2.content.cloneNode(true),
    _el$3 = _el$2.firstChild,
    _el$4 = _el$3.nextSibling;
  r$.insert(_el$2, inserted, null, _el$4);
  return _el$2;
})();
var singleExpression = (function() {
  var _el$5 = document.createDocumentFragment();
  r$.insert(_el$5, inserted);
  return _el$5;
})();
var singleDynamic = (function() {
  var _el$6 = document.createDocumentFragment();
  r$.insert(_el$6, inserted);
  return _el$6;
})();
