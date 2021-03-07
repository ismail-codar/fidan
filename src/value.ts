// https://github.com/jbreckmckye/trkl/blob/master/trkl.js
import { Observable, ObservableArray, Computation } from '../typings/fidan';
import { observableArray } from './array';
// Computations are a tuple of: [ subscriber ]
var computedTracker = [];

export function value<T>(
  val?: T
): T extends Observable<any>
  ? ReturnType<T>
  : T extends Array<T>
  ? ObservableArray<T>
  : Observable<T> {
  var subscribers = [];

  var self = function(...args) {
    return args.length ? write(args[0]) : read();
  } as Observable<T>;
  if (typeof val === 'function' && val.hasOwnProperty('$val')) {
    val = val['$val'];
  }
  self.$val = val;
  if (Array.isArray(val)) {
    observableArray(self as any);
  }

  // declaring as a private function means the minifier can scrub its name on internal references
  var subscribe = (subscriber, immediate?) => {
    if (!~subscribers.indexOf(subscriber)) {
      subscribers.push(subscriber);
    }
    if (immediate) {
      subscriber(val);
    }
    return self;
  };

  // Using string keys tells Uglify that we intend to export these symbols
  self['subscribe'] = subscribe;

  self['unsubscribe'] = subscriber => {
    remove(subscribers, subscriber);
  };

  function write(newValue) {
    if (typeof newValue === 'function' && newValue.hasOwnProperty('$val')) {
      newValue = newValue['$val'];
    }
    self.$val = newValue;
    if (Array.isArray(newValue)) {
      observableArray(self as any);
    }
    if (newValue === val && (val === null || typeof val !== 'object')) {
      return;
    }

    var oldValue = val;
    val = newValue;

    for (let i = subscribers.length - 1; i > -1; i--) {
      // Errors will just terminate the effects
      subscribers[i](val, oldValue);
    }
  }

  function read() {
    var runningComputation = computedTracker[computedTracker.length - 1];
    if (runningComputation) {
      subscribe(runningComputation[0]);
    }
    return val;
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

value['fromValue'] = executor => {
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
