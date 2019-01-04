var counter$ = fjsx.value(0);
var x$ = fjsx.value(x + 1);
var y$ = fjsx.initCompute(function() {
	return x$.$val + 1;
}, x$);
var a$ = fjsx.value(null);
var b$ = fjsx.value(null);
fidan(
	'button',
	{
		onClick: function onClick() {
			return counter$(counter$.$val + 1);
		}
	},
	' + '
);
