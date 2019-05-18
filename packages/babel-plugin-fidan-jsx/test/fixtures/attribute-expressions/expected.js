const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div id='main'><h1><a>Welcome</a></h1></div>";
var welcoming = "Welcome";
var selected = true;
var color = "red";
var props = {
  some: "stuff",
  no: "thing"
};
var link;
var template = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true),
    _el$2 = _el$.firstChild,
    _el$3 = _el$2.firstChild;
  Object.assign(_el$.style, {
    color: color
  });
  _r$.spread(_el$2, props);
  _r$.spread(_el$2, results);
  _el$2.title = welcoming;
  Object.assign(_el$2.style, {
    backgroundColor: color
  });
  link = _el$3;
  _el$3.setAttribute("href", "/");
  return _el$;
})();
