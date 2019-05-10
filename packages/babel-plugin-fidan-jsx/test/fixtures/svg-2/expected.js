var _tmpl$ = document.createElement("template");
_tmpl$.innerHTML =
  "<svg><g><rect class='node' width='60' height='40' rx='5' ry='5'><title></title></rect><text class='label'></text></g></svg>";
var GraphNode = function GraphNode(props) {
  return (function() {
    var _el$ = _tmpl$.content.firstChild.firstChild.cloneNode(true),
      
    return _el$;
  })()["$props"] = props;
};
