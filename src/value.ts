// https://github.com/jbreckmckye/trkl/blob/master/trkl.js

export interface Observable<T> {
  (newValue: T): void; // write
  (): T; // read

  subscribe: AddSubscriber<T>;
  unsubscribe: RemoveSubscriber;
  $val: T;
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

interface Computation<T> {
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

// Computations are a tuple of: [ subscriber ]
var computedTracker = [];

export function value<T>(
  value?: T
): T extends Observable<any>
  ? ReturnType<T>
  : T extends Array<T>
  ? ObservableArray<T>
  : Observable<T> {
  var subscribers = [];

  var self = function(...args) {
    return args.length ? write(args[0]) : read();
  } as Observable<T>;
  self.$val = value;

  // declaring as a private function means the minifier can scrub its name on internal references
  var subscribe = (subscriber, immediate?) => {
    if (!~subscribers.indexOf(subscriber)) {
      subscribers.push(subscriber);
    }
    if (immediate) {
      subscriber(value);
    }
    return self;
  };

  // Using string keys tells Uglify that we intend to export these symbols
  self['subscribe'] = subscribe;

  self['unsubscribe'] = subscriber => {
    remove(subscribers, subscriber);
  };

  function write(newValue) {
    self.$val = newValue;
    if (newValue === value && (value === null || typeof value !== 'object')) {
      return;
    }

    var oldValue = value;
    value = newValue;

    for (let i = subscribers.length - 1; i > -1; i--) {
      // Errors will just terminate the effects
      subscribers[i](value, oldValue);
    }
  }

  function read() {
    var runningComputation = computedTracker[computedTracker.length - 1];
    if (runningComputation) {
      subscribe(runningComputation[0]);
    }
    return value;
  }

  self.toString = self['toJSON'] = () => {
    const val = self();
    return val && val['toJSON'] ? val['toJSON']() : val;
  };

  return self as any;
}

value['computed'] = <T>(fn: Computation<T>): Observable<T> => {
  var self = value<T>();
  var computationToken = [runComputed];

  runComputed();
  return self;

  function runComputed() {
    detectCircularity(computationToken);
    computedTracker.push(computationToken);
    var errors, result;
    try {
      result = fn();
    } catch (e) {
      errors = e;
    }
    computedTracker.pop();
    if (errors) {
      throw errors;
    }
    self(result);
  }
};

value['from'] = executor => {
  var self = value();
  executor(self);
  return self;
};

function detectCircularity(token) {
  if (computedTracker.indexOf(token) > -1) {
    throw Error('Circular computation');
  }
}

function remove(array, item) {
  var position = array.indexOf(item);
  if (position > -1) {
    array.splice(position, 1);
  }
}