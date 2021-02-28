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

// Computations are a tuple of: [ subscriber ]
var computedTracker = [];

export function trkl<T>(value?: T): Observable<T> {
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

  return self;
}

trkl['computed'] = <T>(fn: Computation<T>): Observable<T> => {
  var self = trkl<T>();
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

trkl['from'] = executor => {
  var self = trkl();
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
