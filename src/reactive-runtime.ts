import { Observable } from './types';
import { observable } from './observable';

interface IScope {
  values: { [key: string]: Observable<any> };
  parentScopeId: string;
}

export const reactiveRuntime = () => {
  const scopes: { [key: string]: IScope } = {};

  const initVariable = (scopeId: string, name: string, value: any) => {
    scopes[scopeId].values[name] = observable(value);
  };

  const updateVariable = (scopeId: string, name: string, value: any) => {
    getVariable(scopeId, name)(value);
  };

  const getVariable = (scopeId: string, name: string) =>
    scopes[scopeId].values[name] !== undefined
      ? scopes[scopeId].values[name]
      : scopes[scopeId].parentScopeId
      ? getVariable(scopes[scopeId].parentScopeId, name)
      : null;

  const callFunction = (scopeId: string, fn: Function, ...args: any[]) => {
    const cmp = observable.computed(() => {
      const _args = args.map(arg => {
        if (typeof arg === 'object') {
          console.warn('TODO: deep scan', arg);
        } else if (typeof arg === 'function' && arg.hasOwnProperty('$val')) {
          return arg();
        }
        return arg;
      });
      return fn.apply(null, _args);
    });
    return cmp();
  };

  const initScope = (parentScopeId: string, scopeId: string) => {
    if (!scopes[parentScopeId]) {
      scopes[parentScopeId] = {
        values: {},
        parentScopeId: null,
      };
    }
    scopes[scopeId] = {
      values: {},
      parentScopeId,
    };
  };

  return {
    initScope,
    initVariable,
    updateVariable,
    getVariable,
    callFunction,
  };
};
