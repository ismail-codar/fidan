"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DemoView = void 0;

var DemoView = function DemoView(props) {
  // @tracked_set
  var data = props.data;
  return fidan("div", null, function(element) {
    element = fjsx.createTextNode(element);
    fjsx.compute(function() {
      element.textContent = data.$val;
    }, data);
  });
};

exports.DemoView = DemoView;
