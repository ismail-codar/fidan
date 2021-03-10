import { Observable } from './types';
import { observable } from './observable';

export const injectToProperty = (
  obj: Object,
  propertyKey: string,
  val: Observable<any>
) => {
  // const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
  // if (descr.configurable)
  Object.defineProperty(obj, propertyKey, {
    configurable: true,
    enumerable: true,
    get: () => {
      val();
      return val;
    },
    set: v => (v.hasOwnProperty('$val') ? (val = v) : val(v)),
  });
  // else {
  //   // descr.get().c_depends.push(val);
  //   // val["c_depends"].push(descr.get());s
  // }
};

// export const inject = <T extends Object>(obj: T): T => {
//   for (var key in obj) {
//     injectToProperty(obj, key, observable(obj[key]) as any);
//   }
//   return obj;
// };

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

export const access = arg => {
  return typeof arg === 'function' ? arg() : arg;
};

export const assign = (left: any, right: any) => {
  const rightValue = typeof right === 'function' ? right() : right;
  if (typeof left === 'function') {
    left(rightValue);
    return left;
  } else {
    return rightValue;
  }
};
