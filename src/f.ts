import { FidanValue, ComputionMethodArguments, FidanValueFn, FidanArray } from '.';

let autoTracks: any[] = null;

export const value = <T>(val?: T): FidanValueFn<T> => {
	if (val && val.hasOwnProperty('$val')) return val as any;
	const innerFn: any = (val?: T, opt?: ComputionMethodArguments<T>) => {
		if (val === undefined) {
			if (autoTracks && autoTracks.indexOf(innerFn) === -1) autoTracks.push(innerFn);
			return innerFn['$val'];
		} else {
			const updateAfter = Array.isArray(val);
			if (!updateAfter) {
				innerFn['$val'] = val;
			}
			let depends: FidanValue<any>[] = innerFn['c_depends'];
			if (depends.length)
				for (var i = 0; i < depends.length; i++) {
					if (depends[i].compute) {
						depends[i](depends[i].compute(val, { caller: innerFn }), { caller: depends[i] });
					} else {
						depends[i](innerFn.$val, innerFn);
					}
				}
			if (updateAfter) {
				innerFn['$val'] = val;
				overrideArrayMutators(innerFn);
			}
		}
	};

	innerFn['$val'] = val;
	innerFn['c_depends'] = [];
	innerFn.debugName = (name: string) => {
		Object.defineProperty(innerFn, 'name', { value: name });
		return innerFn;
	};
	innerFn.toString = innerFn.toJSON = () =>
		innerFn['$val'] && innerFn['$val'].toJSON ? innerFn['$val'].toJSON() : innerFn['$val'];
	innerFn.depends = (...deps: (FidanValue<any> | Function)[]): any => {
		for (var i = 0; i < deps.length; i++) innerFn['c_depends'].push(deps[i]);
		innerFn(innerFn()); //trigger to c_depends
		return innerFn;
	};

	if (Array.isArray(val)) {
		innerFn['map'] = (renderFn, renderMode) => ({
			arr: innerFn,
			renderFn,
			renderMode
		});
	}

	return innerFn;
};

export const computed = <T>(fn: (val: T, opt?: ComputionMethodArguments<T>) => any, dependencies?: any[]): any => {
	autoTracks = dependencies ? null : [];
	const cmp = value<T>(undefined);
	const val = fn(undefined, { caller: cmp } as any);
	cmp.$val = val;
	if (Array.isArray(val)) {
		overrideArrayMutators(cmp as any);
	}
	const deps = autoTracks ? autoTracks : dependencies;
	autoTracks = null;
	cmp['compute'] = fn;
	for (var i = 0; i < deps.length; i++) deps[i]['c_depends'].push(cmp);
	return cmp;
};

const overrideArrayMutators = (dataArray: FidanArray<any[]>) => {
	if (!dataArray.size) dataArray.size = value(dataArray.$val.length);
	else dataArray.size(dataArray.$val.length);
	if (dataArray.$val['$overrided']) return;
	dataArray.$val['$overrided'] = true;
	[ 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ].forEach((method) => {
		dataArray.$val[method] = function() {
			const arr = dataArray.$val.slice(0);
			const size1 = arr.length;
			const ret = Array.prototype[method].apply(arr, arguments);
			const size2 = arr.length;
			if (size1 !== size2) dataArray.size(size2);
			// TODO event based strategy for -> 'pop, push, shift, splice, unshift'
			dataArray(arr, {
				method,
				caller: dataArray,
				args: [ ...arguments ]
			});
			return ret;
		};
	});
};
