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
