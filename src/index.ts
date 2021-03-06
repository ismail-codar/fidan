import { value } from './value';

export * from './value';
export * from './array';
export * from './util';
export * from './html';

export const useComputed = <T>(fn: () => T): T => {
  return value.computed(fn) as any;
};
export const computed = <T>(fn: () => T): T => {
  return value.computed(fn) as any;
};
export const useSubscribe = (computed: any, subscriber: (val: any) => void) => {
  computed.subscribe(subscriber);
};
