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

	return <div>c: {c}</div>;
};
