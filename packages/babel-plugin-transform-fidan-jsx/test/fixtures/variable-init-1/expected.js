var counter$ = fidan.value(0);
var x$ = fidan.value(x + 1);
var y$ = fidan.initCompute(function() {
	return x$.$val + 1;
}, x$);
var a$ = fidan.value(null);
var b$ = fidan.value(null);
fidan.createElement(
	'button',
	{
		onClick: function onClick() {
			return counter$(counter$.$val + 1);
		}
	},
	' + '
);
