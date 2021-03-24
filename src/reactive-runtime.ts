import { Observable } from './types';
import { observable } from './observable';

export const reactiveRuntime = () => {
  const values: { [key: string]: Observable<any> } = {};

  const initVariable = (name: string, value: any) => {
    values[name] = observable(value);
  };

  const updateVariable = (name: string, value: any) => {
    values[name](value);
  };

  const getVariable = (name: string) => values[name];

  const callFunction = (fnResult: any, ...args: any[]) => {
    // const rr$ = args.push(reactiveRuntime());
    return fnResult;
  };

  const beginScope = () => {};
  const endScope = (param?: any) => {
    return param;
  };

  return {
    beginScope,
    endScope,
    getVariable,
    initVariable,
    updateVariable,
    callFunction,
  };
};
