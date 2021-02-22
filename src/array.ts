import trkl, { Observable } from 'trkl';

const simpleMutationMethods = ['pop', 'push', 'shift', 'splice', 'unshift'];
const complexMutationMethods = ['copyWithin', 'fill', 'reverse', 'sort'];
const mutationMethods = simpleMutationMethods.concat(complexMutationMethods);
const nonMutationmethods = [
  'concat',
  'entries',
  'every',
  'filter',
  'find',
  'findIndex',
  'forEach',
  'from',
  'includes',
  'indexOf',
  'isArray',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'toString',
  'valueOf',
];

type ObservableArrayType<T extends Array<T[0]>> = Observable<T> & Array<T[0]>;
export interface ObservableArray<T extends Array<any>>
  extends ObservableArrayType<T> {
  size: Observable<number>;
  map: (item: any, index?: number, renderMode?: 'reuse' | 'reconcile') => any;
}

export const observableArray = <T>(dataArray: Observable<T[]>) => {
  const arrVal = dataArray();
  if (!dataArray['size']) dataArray['size'] = trkl(arrVal.length);
  else dataArray['size'](arrVal.length);

  nonMutationmethods.forEach(method => {
    dataArray[method] = (...args) => arrVal[method].apply(arrVal, args);
  });
  dataArray['map'] = (renderFn, renderMode) => ({
    arr: dataArray,
    renderFn,
    renderMode,
  });
  Object.defineProperty(dataArray, 'length', {
    configurable: true,
    enumerable: true,
    get: () => {
      return arrVal.length;
    },
    set: v => (arrVal.length = v),
  });
  mutationMethods.forEach(method => {
    dataArray[method] = function() {
      const arr = arrVal.slice(0);
      const ret = Array.prototype[method].apply(arr, arguments);
      // TODO event based strategy for -> simpleMutationMethods
      dataArray(arr);
      return ret;
    };
  });
  return dataArray as ObservableArray<T[]>;
};
