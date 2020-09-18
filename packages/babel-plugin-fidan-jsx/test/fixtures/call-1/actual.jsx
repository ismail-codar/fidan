import * as fidan from '@fidanjs/runtime';

const view = () => {
	var a = 1;
	var b = 2;
	var c = someFunction1(a, b);
	var d = 3;
	console.log(d);

	return (
		<div>
			c: {c} f: {someFunction2(c, d)}
		</div>
	);
};
