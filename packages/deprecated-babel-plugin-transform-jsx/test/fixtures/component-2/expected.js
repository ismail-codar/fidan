"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DemoView = void 0;

var DemoView = function DemoView(props) {
  var data$ = props.data$;
  return fidan.createElement("div", null, function _(element) {
    element = fidan.createTextNode(element);
    fidan.computed(function _2() {
      element.textContent = data$.$val;
    }, data$);
  });
};

exports.DemoView = DemoView;
