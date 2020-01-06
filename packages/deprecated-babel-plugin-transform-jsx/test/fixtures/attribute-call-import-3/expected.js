var _util = require("./util");
var View = function View(props) {
  var linkText$ = fidan.value("");
  return fidan.createElement("a", {
    href: function _(element) {
      fidan.computed(function _2() {
        element.href = (0, _util.linkUrl)(linkText$);
      }, linkText$);
    }
  });
};
