"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var name1$ = fidan.value("");
var surname1$ = fidan.value("");

var Test1 = function Test1() {
  _classCallCheck(this, Test1);

  this.value$ = fidan.value(1);
  this.name$ = name1$;
  this.fullname$ = fidan.initCompute(
    function _() {
      return name1$.$val + " " + surname1$.$val;
    },
    name1$,
    surname1$
  );
  this.id = 0;
};
