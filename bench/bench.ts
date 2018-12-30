import { value } from '../src/f';

var now = typeof process === 'undefined' ? browserNow : nodeNow;

var COUNT = 1e5;

main();

function main() {
	bench(createDataSignals, COUNT, COUNT);
	bench(createComputations0to1, COUNT, 0);
	bench(createComputations1to1, COUNT, COUNT);
	bench(createComputations2to1, COUNT, 2 * COUNT);
	bench(createComputations4to1, COUNT, 4 * COUNT);
	bench(createComputations1000to1, COUNT / 100, 10 * COUNT);
	//bench1(createComputations8, COUNT, 8 * COUNT);
	bench(createComputations1to2, COUNT, 0.5 * COUNT);
	bench(createComputations1to4, COUNT, 0.25 * COUNT);
	bench(createComputations1to8, COUNT, 0.125 * COUNT);
	bench(createComputations1to1000, COUNT, 0.001 * COUNT);
	console.log('---');
	bench(updateComputations1to1, COUNT * 4, 1);
	bench(updateComputations2to1, COUNT * 2, 2);
	bench(updateComputations4to1, COUNT, 4);
	bench(updateComputations1000to1, COUNT / 100, 1000);
	bench(updateComputations1to2, COUNT * 4, 1);
	bench(updateComputations1to4, COUNT * 4, 1);
	bench(updateComputations1to1000, COUNT * 4, 1);
}

function bench(fn, count, scount) {
	var time = run(fn, count, scount);
	console.log(`${fn.name}: ${time}`);
}

function run(fn, n, scount) {
	// prep n * arity sources
	var start, end;

	// run 3 times to warm up
	var sources = createDataSignals(scount, []);
	fn(n / 100, sources);
	sources = createDataSignals(scount, []);
	fn(n / 100, sources);
	sources = createDataSignals(scount, []);
	// %OptimizeFunctionOnNextCall(fn);
	fn(n / 100, sources);
	sources = createDataSignals(scount, []);
	for (var i = 0; i < scount; i++) {
		sources[i].$val;
		sources[i].$val;
		// %OptimizeFunctionOnNextCall(sources[i]);
		sources[i].$val;
	}

	// start GC clean
	// %CollectGarbage(null);

	start = now();

	fn(n, sources);

	// end GC clean
	// %CollectGarbage(null);

	end = now();

	return end - start;
}

function createDataSignals(n, sources) {
	for (var i = 0; i < n; i++) {
		sources[i] = value(i);
	}
	return sources;
}

function createComputations0to1(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation0(i);
	}
}

function createComputations1to1000(n, sources) {
	for (var i = 0; i < n / 1000; i++) {
		for (var j = 0; j < 1000; j++) {
			createComputation1(sources[i]);
		}
		//sources[i] = null;
	}
}

function createComputations1to8(n, sources) {
	for (var i = 0; i < n / 8; i++) {
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		//sources[i] = null;
	}
}

function createComputations1to4(n, sources) {
	for (var i = 0; i < n / 4; i++) {
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		//sources[i] = null;
	}
}

function createComputations1to2(n, sources) {
	for (var i = 0; i < n / 2; i++) {
		createComputation1(sources[i]);
		createComputation1(sources[i]);
		//sources[i] = null;
	}
}

function createComputations1to1(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation1(sources[i]);
		//sources[i] = null;
	}
}

function createComputations2to1(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation2(sources[i * 2], sources[i * 2 + 1]);
		//sources[i * 2] = null;
		//sources[i * 2 + 1] = null;
	}
}

function createComputations4to1(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation4(sources[i * 4], sources[i * 4 + 1], sources[i * 4 + 2], sources[i * 4 + 3]);
		//sources[i * 4] = null;
		//sources[i * 4 + 1] = null;
		//sources[i * 4 + 2] = null;
		//sources[i * 4 + 3] = null;
	}
}

function createComputations8(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation8(
			sources[i * 8],
			sources[i * 8 + 1],
			sources[i * 8 + 2],
			sources[i * 8 + 3],
			sources[i * 8 + 4],
			sources[i * 8 + 5],
			sources[i * 8 + 6],
			sources[i * 8 + 7]
		);
		sources[i * 8] = null;
		sources[i * 8 + 1] = null;
		sources[i * 8 + 2] = null;
		sources[i * 8 + 3] = null;
		sources[i * 8 + 4] = null;
		sources[i * 8 + 5] = null;
		sources[i * 8 + 6] = null;
		sources[i * 8 + 7] = null;
	}
}

// only create n / 100 computations, as otherwise takes too long
function createComputations1000to1(n, sources) {
	for (var i = 0; i < n; i++) {
		createComputation1000(sources, i * 1000);
	}
}

function createComputation0(i) {
	const _s = value(function() {
		return i;
	});
}

function createComputation1(s1: any) {
	const _s = value(function() {
		return s1.$val;
	});
	s1.depends.push(_s);
}

function createComputation2(s1: any, s2: any) {
	const _s = value(function() {
		return s1.$val + s2.$val;
	});
	s1.depends.push(_s);
	s2.depends.push(_s);
}

function createComputation4(s1: any, s2: any, s3: any, s4: any) {
	const _s = value(function() {
		return s1.$val + s2.$val + s3.$val + s4.$val;
	});
	s1.depends.push(_s);
	s2.depends.push(_s);
	s3.depends.push(_s);
	s4.depends.push(_s);
}

function createComputation8(s1: any, s2: any, s3: any, s4: any, s5: any, s6: any, s7: any, s8: any) {
	const _s = value(function() {
		return s1.$val + s2.$val + s3.$val + s4.$val + s5.$val + s6.$val + s7.$val + s8.$val;
	});
	s1.depends.push(_s);
	s2.depends.push(_s);
	s3.depends.push(_s);
	s4.depends.push(_s);
	s5.depends.push(_s);
	s6.depends.push(_s);
	s7.depends.push(_s);
	s8.depends.push(_s);
}

function createComputation1000(ss, offset) {
	const _s = value(function() {
		var sum = 0;
		for (var i = 0; i < 1000; i++) {
			sum += ss[offset + i];
		}
		return sum;
	});
}

function updateComputations1to1(n, sources: any[]) {
	var s1: any = sources[0],
		c = value(function() {
			return s1.$val;
		});
	s1.depends.push(c);
	for (var i = 0; i < n; i++) {
		s1(i);
	}
}

function updateComputations2to1(n, sources: any[]) {
	var s1 = sources[0],
		s2 = sources[1],
		c = value(function() {
			return s1.$val + s2.$val;
		});
	s1.depends.push(c);
	s2.depends.push(c);
	for (var i = 0; i < n; i++) {
		s1(i);
	}
}

function updateComputations4to1(n, sources: any[]) {
	var s1 = sources[0],
		s2 = sources[1],
		s3 = sources[2],
		s4 = sources[3],
		c = value(function() {
			return s1.$val + s2.$val + s3.$val + s4.$val;
		});
	s1.depends.push(c);
	s2.depends.push(c);
	s3.depends.push(c);
	s4.depends.push(c);
	for (var i = 0; i < n; i++) {
		s1(i);
	}
}

function updateComputations1000to1(n, sources: any[]) {
	var s1 = sources[0],
		c = value(function() {
			var sum = 0;
			for (var i = 0; i < 1000; i++) {
				sum += sources[i].$val;
			}
			return sum;
		});
	for (var i = 0; i < 1000; i++) {
		sources[i].depends.push(c);
	}
	for (var i = 0; i < n; i++) {
		s1(i);
	}
}

//TODO updateComputations1to2
function updateComputations1to2(n, sources: any[]) {
	var s1 = sources[0],
		c1 = value(function() {
			return s1.$val;
		}),
		c2 = value(function() {
			return s1.$val;
		});
	s1.depends.push(c1);
	s1.depends.push(c2);
	for (var i = 0; i < n / 2; i++) {
		s1(i);
	}
}

function updateComputations1to4(n, sources: any[]) {
	var s1 = sources[0],
		c1 = value(function() {
			return s1.$val;
		}),
		c2 = value(function() {
			return s1.$val;
		}),
		c3 = value(function() {
			return s1.$val;
		}),
		c4 = value(function() {
			return s1.$val;
		});
	s1.depends.push(c1);
	s1.depends.push(c2);
	s1.depends.push(c3);
	s1.depends.push(c4);
	for (var i = 0; i < n / 4; i++) {
		s1(i);
	}
}

function updateComputations1to1000(n, sources: any[]) {
	var s1 = sources[0];
	for (var i = 0; i < 1000; i++) {
		var _s = value(function() {
			return s1.$val;
		});
		s1.depends.push(_s);
	}
	for (var i = 0; i < n / 1000; i++) {
		s1(i);
	}
}

function browserNow() {
	return performance.now();
}

function nodeNow() {
	var hrt = process.hrtime();
	return hrt[0] * 1000 + hrt[1] / 1e6;
}

function repeat(n, val) {
	var arr = [];
	for (var i = 0; i < n; i++) {
		arr[i] = val;
	}
	return arr;
}
