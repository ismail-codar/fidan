export interface FidanValue<T> {
  (val?: T): T;
  $val: T;
  debugName: (name: string) => FidanValue<T>;
  depends: (dependencies: () => FidanData<any>[]) => FidanValue<T>;
}

export type FidanArrayEventType =
  | "itemadded"
  | "itemset"
  | "itemremoved"
  | "beforemulti"
  | "aftermulti";

export interface EventedArrayReturnType<T> extends Array<T> {
  on: (type: FidanArrayEventType, callback) => void;
  off: any;
  innerArray: T[];
  setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}

export interface FidanArray<T> {
  (val?: T[]): T[] & EventedArrayReturnType<T>;
  readonly $val: T[] & EventedArrayReturnType<T>;
  size?: FidanValue<number>;
  debugName: (name: string) => FidanArray<T>;
  depends: (dependencies: () => FidanData<any>[]) => FidanArray<T>;
}

export type FidanData<T> = FidanValue<T> | FidanArray<T>;

import * as fidanObj from "./index-libs";
export const fidan = fidanObj;
