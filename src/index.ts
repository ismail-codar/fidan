import { trkl } from './trkl';

export * from './trkl';
export * from './util';
export * from './html';

export const useComputed = <T>(fn: () => T): T => {
  return trkl.computed(fn) as any;
};
export const useSubscribe = (computed: any, subscriber: (val: any) => void) => {
  computed.subscribe(subscriber);
};
