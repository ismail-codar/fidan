const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true);
_el$.__dblclick = function(e) {
  return console.log(e);
};
_el$;
_tmpl$.innerHTML = "<div>DoubleClick</div>";
_r$.delegateEvents(["dblclick"]);
