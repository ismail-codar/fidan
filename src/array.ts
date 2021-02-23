import { Observable, trkl } from './trkl';
import reconcile from './reconcile';
import { reuseNodes } from './reuse-nodes';

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
  map: (item: any, index?: number, renderMode?: 'reuse' | 'reconcile') => any;
}

export const observableArray = <T>(dataArray?: Observable<T[]>) => {
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

export const arrayMap = <T>(
  arr: Observable<T[]>,
  parentDom: Node & ParentNode,
  nextElement: Element,
  renderCallback: (item: any, idx?: number, isInsert?: boolean) => Node,
  renderMode: 'reuse' | 'reconcile' = 'reconcile'
) => {
  const prevElement = nextElement ? document.createTextNode('') : undefined;
  nextElement && parentDom.insertBefore(prevElement, nextElement);
  let prevVal = [];
  arr.subscribe(nextVal => {
    const renderFunction: (
      parent,
      renderedValues,
      data,
      createFn,
      noOp,
      beforeNode?,
      afterNode?
    ) => void = renderMode === 'reconcile' ? reconcile : reuseNodes;
    renderFunction(
      parentDom,
      prevVal || [],
      nextVal || [],
      (nextItem, index) => {
        let rendered = renderCallback(nextItem, index) as any;
        return rendered instanceof Node
          ? rendered
          : document.createTextNode(rendered);
      },
      () => {},
      prevElement,
      nextElement
    );
    prevVal = nextVal.slice(0);
  }, true);
};
