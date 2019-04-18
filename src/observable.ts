import { jsRoot } from "./util";
import { FidanValue } from ".";
import { value } from "./f";

function symbolObservablePonyfill(root) {
  let result;
  const Symbol = root.Symbol;

  if (typeof Symbol === "function") {
    if (Symbol.observable) {
      result = Symbol.observable;
    } else {
      result = Symbol("observable");
      Symbol.observable = result;
    }
  } else {
    result = "@@observable";
  }

  return result;
}

const $$symbolObservable = symbolObservablePonyfill(jsRoot());

class Observer {
  isUnsubscribed = false;
  handlers: Partial<Observer> = null;
  _unsubscribe = null;
  constructor(handlers: Partial<Observer>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  _subscribe: (observer: Observer) => () => void = null;
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(obs: Partial<Observer>) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      }
    };
  }

  [$$symbolObservable]() {
    return this;
  }
}

export const toObservable = <T>(data: FidanValue<any>): T => {
  return new Observable(observer => {
    var compute = value(() => {
      observer.next(data.$val);
    });
    data["depends"].push(compute);
  }) as any;
};
