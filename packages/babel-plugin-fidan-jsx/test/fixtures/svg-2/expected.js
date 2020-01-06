const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML =
  "<svg><g><rect class='node' height='40' rx='5' ry='5'><title></title></rect><text class='label'></text></g></svg>";
var GraphNode = function GraphNode(props) {
  if (!props.x) return null;
  var propX = value(props.x);
  var propY = value(props.y);
  injectToProperty(props, "x", propX);
  injectToProperty(props, "y", propY);
  computed(function() {
    console.log(propX(), propY());
  });
  return (function() {
    var _el$ = _tmpl$.content.firstChild.firstChild.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild,
      _el$4 = _el$2.nextSibling;
    _el$2.setAttribute("width", 100);
    _r$.attr(
      _el$2,
      "x",
      true,
      computed(function() {
        return propX() - props.width / 2;
      })
    );
    _r$.attr(
      _el$2,
      "y",
      true,
      computed(function() {
        return propY() - props.height / 2;
      })
    );
    _r$.insert(_el$3, props.name);
    _r$.attr(_el$4, "x", true, propX);
    _r$.attr(
      _el$4,
      "y",
      true,
      computed(function() {
        return propY() + 10;
      })
    );
    _r$.insert(_el$4, props.name);
    _el$.$props = props;
    return _el$;
  })();
};
