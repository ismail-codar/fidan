"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DemoView = void 0;

var a$ = fidan.value(1111);

var DemoView = function DemoView() {
  return fidan.createElement("div", null, function _(element) {
    element = fidan.createTextNode(element);
    fidan.compute(function _2() {
      element.textContent = a$.$val;
    }, a$);
  });
};

exports.DemoView = DemoView;
