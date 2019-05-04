function linkUrl(text$) {
  return "/" + text$.$val;
}
var View = function View(props) {
  var linkText$ = fidan.value("");
  return fidan.createElement("a", {
    href: function _(element) {
      fidan.compute(function _2() {
        element.href = linkUrl(linkText$);
      }, linkText$);
    }
  });
};
