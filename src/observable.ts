import { FidanValue, value } from '.';
import $$symbolObservable from 'symbol-observable';

// https://medium.com/@fknussel/a-simple-observable-implementation-c9c809c89c69

class Observer {
	isUnsubscribed = false;
	handlers: Partial<Observer> = null;
	_unsubscribe = null;
	constructor(handlers: Partial<Observer>) {
		this.handlers = handlers; // next, error and complete logic
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
	return new Observable((observer) => {
		var compute = value(() => {
			observer.next(data.$val);
		});
		data['depends'].push(compute);
	}) as any;
};
