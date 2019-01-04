var x$ = fidan.value(9);
var a = 1,
	b = 2,
	c = a + b + x$.$val;
var d$ = fidan.initCompute(function() {
	return x$.$val + a;
}, x$);
d$ = fidan.setCompute(
	d$,
	function() {
		return x$.$val + a + 1;
	},
	x$
);
var e = 3;
var f$ = fidan.value(4);
d$ = f$;
console.log(d$.$val);
window.console.log(d$.$val);
alert(d$.$val + e);
