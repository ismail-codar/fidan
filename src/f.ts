import { FidanValue, ComputionMethodArguments, FidanValueFn } from '.';

let autoTracks: any[] = null;

export const value = <T>(val?: T): FidanValueFn<T> => {
	if (val && val.hasOwnProperty('$val')) return val as any;
	const innerFn: any = (val?: T, opt?: ComputionMethodArguments<T>) => {
		const currentVal = Array.isArray(innerFn['$val']) ? innerFn['$val'].slice(0) : innerFn['$val'];
		if (val === undefined) {
			if (autoTracks && autoTracks.indexOf(innerFn) === -1) {
				autoTracks.push(innerFn);
			}
			return currentVal;
		} else {
			let depends: FidanValue<any>[] = innerFn['c_depends'];
			if (depends.length)
				for (var i = 0; i < depends.length; i++) {
					if (depends[i].compute) {
						depends[i](depends[i].compute(val, { caller: innerFn }), { caller: depends[i] });
					} else {
						depends[i](innerFn.$val, innerFn);
					}
				}

			innerFn['$val'] = val;
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
	const cmp = value<T>();
	const val = fn(undefined, { caller: cmp } as any);
	cmp.$val = val;
	const deps = autoTracks ? autoTracks : dependencies;
	autoTracks = null;
	cmp['compute'] = fn;
	for (var i = 0; i < deps.length; i++) deps[i]['c_depends'].push(cmp);
	return cmp;
};
