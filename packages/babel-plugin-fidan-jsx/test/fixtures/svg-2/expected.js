const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML =
  "<svg><g><rect class='node' width='60' height='40' rx='5' ry='5'><title></title></rect><text class='label'></text></g></svg>";
var GraphNode = function GraphNode(props) {
  if (!props.x) return null;
  var propX = value(props.x);
  var propY = value(props.y);
  injectToProperty(props, "x", propX);
  injectToProperty(props, "y", propY);
  compute(function() {
    console.log(propX(), propY());
  });
  return (function() {
    var _el$ = _tmpl$.content.firstChild.firstChild.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild,
      _el$4 = _el$2.nextSibling;
    _r$.attr(
      _el$2,
      "x",
      true,
      compute(function() {
        return propX() - props.width / 2;
      })
    );
    _r$.attr(
      _el$2,
      "y",
      true,
      compute(function() {
        return propY() - props.height / 2;
      })
    );
    _r$.insert(_el$3, props.name);
    _r$.attr(_el$4, "x", true, propX());
    _r$.attr(
      _el$4,
      "y",
      true,
      compute(function() {
        return propY() + 10;
      })
    );
    _r$.insert(_el$4, props.name);
    return _el$;
  })();
};
