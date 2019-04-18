export interface FidanValue<T> {
  (val?: T): T;
  readonly $val: T;
}

export type FidanArrayEventType =
  | "itemadded"
  | "itemset"
  | "itemremoved"
  | "beforemulti"
  | "aftermulti";

export interface EventedArrayReturnType<T> {
  on: (type, callback) => void;
  off: any;
  innerArray: T[];
  setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}

export interface FidanArray<T> {
  (val?: T[]): T[] & EventedArrayReturnType<T>;
  readonly $val: T[] & EventedArrayReturnType<T>;
}

import * as fidanObj from "./index-libs";
export const fidan = fidanObj;
