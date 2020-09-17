const view = () => {
	var a = 1;
	var b = 2;
	var c = someFunction(a, b);
	var d = c;
	console.log(d);
	d = 1;
	var e = d;
	console.log(e);
	e = c;
	var g = 1;
	var h = 2;
	g = 3;
	h = 4;
	g = h;

	return <div>c: {c}</div>;
};
