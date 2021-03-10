export interface Observable<T> {
  (newValue: T): void; // write
  (): T; // read

  subscribe: AddSubscriber<T>;
  unsubscribe: RemoveSubscriber;
  $val?: T;
}

interface Subscriber<T> {
  (latest: T, last?: T): any | void;
}

interface AddSubscriber<T> {
  (subscriber: Subscriber<T>, runImmediate?: boolean): Observable<T>;
}

interface RemoveSubscriber {
  (subscriber: Subscriber<any>): void;
}

export interface Computation<T> {
  (): T;
}

interface Writer {
  (observable: Observable<any>): void;
}

type ObservableArrayType<T extends Array<T[0]>> = Observable<T> & Array<T[0]>;
export interface ObservableArray<T extends Array<any>>
  extends ObservableArrayType<T> {
  map: (item: any, index?: number, renderMode?: 'reuse' | 'reconcile') => any;
}
