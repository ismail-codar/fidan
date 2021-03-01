import { frvl } from './frvl';

export * from './frvl';
export * from './util';
export * from './html';

export const useComputed = <T>(fn: () => T): T => {
  return frvl.computed(fn) as any;
};
export const useSubscribe = (computed: any, subscriber: (val: any) => void) => {
  computed.subscribe(subscriber);
};
