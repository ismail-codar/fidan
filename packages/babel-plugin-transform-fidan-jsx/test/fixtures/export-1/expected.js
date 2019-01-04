"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.externalData = void 0;

var externalData = fjsx.value(1);
exports.externalData = externalData;
console.log(externalData.$val);
setInterval(function() {
  externalData(externalData.$val + 1);
}, 1000);
