import { observable } from './observable';

export * from './types';
export * from './observable';
export * from './array';
export * from './util';
export * from './html';
export * from './reactive-runtime';

export const useComputed = <T>(fn: () => T): T => {
  return observable.computed(fn) as any;
};
export const computed = <T>(fn: () => T): T => {
  return observable.computed(fn) as any;
};
export const useSubscribe = (computed: any, subscriber: (val: any) => void) => {
  computed.subscribe(subscriber);
};

declare global {
  namespace JSX {
    interface Element extends HTMLElement {}
  }
}
