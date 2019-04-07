import { value } from "./f";

export const setDefaults = <T>(
  obj: T,
  defaults: { [key in keyof T]?: any }
) => {
  for (var key in defaults) {
    if (obj[key] === undefined) obj[key] = defaults[key];
  }
};

export const mapProperty = (obj: Object, propertyKey: string, value$: any) => {
  const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
  if (descr.configurable)
    Object.defineProperty(obj, propertyKey, {
      configurable: false,
      enumerable: true,
      get: () => {
        return value$.$val;
      },
      set: value$
    });
  else {
    descr.set["depends"].push(
      value(() => {
        value$(obj[propertyKey]);
      })
    );
  }
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
