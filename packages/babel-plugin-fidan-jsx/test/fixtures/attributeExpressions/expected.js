const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div id='main'><h1><a>Welcome</a></h1></div>";
var welcoming = "Welcome";
var selected = true;
var color = "red";
var props = {
  some: "stuff",
  no: "thing"
};
var binding = function binding(el, accessor) {
  return (el.custom = accessor());
};
var link;
var template = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true),
    _el$2 = _el$.firstChild,
    _el$3 = _el$2.firstChild;
  custom(_el$, function() {
    return binding;
  });
  r$.classList(_el$, {
    selected: selected
  });
  Object.assign(_el$.style, {
    color: color
  });
  r$.spread(_el$2, props);
  r$.spread(_el$2, results);
  _el$2.title = welcoming;
  Object.assign(_el$2.style, {
    backgroundColor: color
  });
  r$.classList(_el$2, {
    selected: selected
  });
  link = _el$3;
  _el$3.setAttribute("href", "/");
  return _el$;
})();
