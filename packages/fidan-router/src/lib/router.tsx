import RouteRecognizer from 'route-recognizer';
import { fidan } from '@fidanjs/runtime';
export const instance = new RouteRecognizer();

export const transitionTo = (path: string) => {
	let result = instance.recognize(path);
	if (result) {
		for (var i = 0; i < result.length; i++) {
			var item = result[i] as any;
			item.handler();
		}
		// window.location.hash = props.to;
		window.history.pushState(null, null, path);
	}
};

export const Router = (props: any) => {
	setTimeout(() => {
		transitionTo(window.location.pathname);
	}, 0);
	return <div className="fidan-router-root">{props.children}</div>;
	// fidan.createElement(fidan.Fragment, null, props.children);
};
