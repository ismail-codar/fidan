// @tracked
let x = 9;
let a = 1,
  b = 2,
  c = a + b + x;
// @tracked_set
let d = x + a;
d = x + a + 1;
let e = 3;
// @tracked
let f = 4;
// @tracked_set
d = f;
console.log(d);
window.console.log(d);
alert(d + e);
