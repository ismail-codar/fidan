// @tracked
var x = fidan.value(9);
var a = 1,
	b = 2,
	c = a + b + x.$val;
// @tracked
var d = fidan.initCompute(function() {
	return x.$val + a;
}, x);
// @tracked_set
d = fidan.setCompute(
	d,
	function() {
		return x.$val + a + 1;
	},
	x
);
var e = 3;
// @tracked
var f = fidan.value(4);
// @tracked_set
d = f;
console.log(d.$val);
window.console.log(d.$val);
alert(d.$val + e);
