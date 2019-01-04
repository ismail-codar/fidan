"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activeCount$(void 0);
var activeCount$ = fjsx.initCompute(
  function() {
    return totalCount$.$val - completedCount$.$val;
  },
  totalCount$,
  completedCount$
);
exports.activeCount$(activeCount$.$val);
