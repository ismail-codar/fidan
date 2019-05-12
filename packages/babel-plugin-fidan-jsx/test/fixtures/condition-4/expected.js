const _tmpl$ = document.createElement("template");
var _el$ = _tmpl$.content.firstChild.cloneNode(true),
  _el$2 = _el$.firstChild;
_r$.conditional(
  _el$,
  {
    test: function test() {
      return node.childsType() === "choice";
    },
    consequent: " | ",
    alternate: " - "
  },
  null,
  _el$2
);
_el$;
_tmpl$.innerHTML = "<span><!--2--></span>";
