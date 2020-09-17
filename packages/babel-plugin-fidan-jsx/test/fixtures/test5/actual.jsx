import * as fidan from '@fidanjs/runtime';

const view = () => {
	var a = 1;
	var b = 2;
	var c = someFunction(a, b);
	var d = 3;
	console.log(d);

	return <div>c: {c}</div>;
};
