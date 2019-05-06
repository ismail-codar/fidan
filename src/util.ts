import { value } from "./f";
import { FidanValue } from ".";

export const injectToProperty = (
  obj: Object,
  propertyKey: string,
  val: FidanValue<any>
) => {
  const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
  if (descr.configurable)
    Object.defineProperty(obj, propertyKey, {
      configurable: false,
      enumerable: true,
      get: () => {
        val();
        return val;
      },
      set: v => val(v)
    });
  else {
    descr.set["c_depends"].push(val);
  }
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
