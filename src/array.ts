import { Observable, ObservableArray } from './types';
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

const defineIndexProperty = (_self: any, _array: any[], index: number) => {
  if (!(index in _self)) {
    Object.defineProperty(_self, index, {
      configurable: true,
      enumerable: true,
      get: () => {
        return _array[index];
      },
      set: v => {
        _array[index] = v;
      },
    });
  }
};

export const observableArray = <T>(dataArray?: Observable<T[]>) => {
  nonMutationmethods.forEach(method => {
    dataArray[method] = (...args) => {
      const arrVal = dataArray();
      return arrVal[method].apply(arrVal, args);
    };
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
      return dataArray().length;
    },
    set: v => (dataArray().length = v),
  });
  mutationMethods.forEach(method => {
    dataArray[method] = function() {
      const arr = dataArray().slice(0);
      const ret = Array.prototype[method].apply(arr, arguments);
      // TODO event based strategy for -> simpleMutationMethods
      dataArray(arr);
      // TODO only effected index
      for (var i = 0; i < arr.length; i++) {
        defineIndexProperty(dataArray, arr, i);
      }
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
