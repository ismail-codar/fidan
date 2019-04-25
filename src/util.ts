import { FidanData } from ".";
import { value } from "./f";

export const setDefaults = <T>(
  obj: T,
  defaults: { [key in keyof T]?: any }
) => {
  for (var key in defaults) {
    if (obj[key] === undefined) obj[key] = defaults[key];
  }
};

export const injectToProperty = (
  obj: Object,
  propertyKey: string,
  val: FidanData<any>
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

export const jsRoot = () => {
  let root;

  if (typeof self !== "undefined") {
    root = self;
  } else if (typeof window !== "undefined") {
    root = window;
  } else if (typeof global !== "undefined") {
    root = global;
  } else if (typeof module !== "undefined") {
    root = module;
  } else {
    root = Function("return this")();
  }
  return root;
};
