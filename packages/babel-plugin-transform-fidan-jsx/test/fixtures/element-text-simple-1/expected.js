"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DemoView = void 0;

var a = fjsx.value(1111);

var DemoView = function DemoView() {
  return fidan("div", null, function(element) {
    element = fjsx.createTextNode(element);
    fjsx.compute(function() {
      element.textContent = a.$val;
    }, a);
  });
};

exports.DemoView = DemoView;
