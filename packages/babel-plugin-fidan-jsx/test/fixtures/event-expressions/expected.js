const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML =
  "<div id='main'><button>Click Bound</button><button>Click Delegated</button><button>Click Listener</button></div>";
var template = (function() {
  var _el$ = _tmpl$.content.firstChild.cloneNode(true),
    _el$2 = _el$.firstChild,
    _el$3 = _el$2.nextSibling;
  _el$2.onclick = function() {
    return console.log("bound");
  };
  _el$3.__click = function() {
    return console.log("delegated");
  };
  return _el$;
})();
_r$.delegateEvents(["click"]);
