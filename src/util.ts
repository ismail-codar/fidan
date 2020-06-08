import { value } from './f';
import { FidanValue, FidanArray, DataArrayEvents, ComputionMethodArguments } from '.';

export const injectToProperty = (obj: Object, propertyKey: string, val: FidanValue<any>) => {
	// const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
	// if (descr.configurable)
	Object.defineProperty(obj, propertyKey, {
		configurable: true,
		enumerable: true,
		get: () => {
			val();
			return val;
		},
		set: (v) => (v.hasOwnProperty('$val') ? (val = v) : val(v))
	});
	// else {
	//   // descr.get().c_depends.push(val);
	//   // val["c_depends"].push(descr.get());
	// }
};

export const inject = <T extends Object>(obj: T): T => {
	for (var key in obj) {
		injectToProperty(obj, key, value(obj[key]));
	}
	return obj;
};

export const debounce = (func, wait, immediate?) => {
	let timeout;

	return function() {
		let context = this;
		let args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export const transformToDataArrayEvents = <T>(opt: ComputionMethodArguments<T[]>, events: DataArrayEvents<T>) => {
	/*
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift"
  */

	const { method, computedItem, args } = opt;
	if (!method) {
		const vals: any[] = computedItem.$val;
		if (vals) {
			events.onRemove(vals);
			events.onAdd(vals);
		}
	} else if (method === 'push') {
		args && events.onAdd(args);
	} else if (method === 'splice') {
		const start = args[0];
		const deleteCount = args[1];
		const addItems = args.slice(2);
		const arr: any[] = computedItem.$val;
		events.onRemove(arr.slice(start, start + deleteCount));
		events.onAdd(addItems);
	}
	// TODO yukardaki diğer metodlar implemente edilecek.
};