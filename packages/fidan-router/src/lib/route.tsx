import { fidan } from '@fidanjs/runtime';
import { instance } from './router';

export const Route = (props: { exact?: boolean; path: string; component: Element | ((props) => Element) }) => {
	let viewParent: Element = null;

	instance.add([
		{
			path: props.path,
			handler: () => {
				if (viewParent) {
					fidan.activateContext(props['$context']);
					const rendered = typeof props.component === 'function' ? props.component(props) : props.component;
					fidan.deactivateContext(props['$context']);
					if (viewParent.firstChild) viewParent.replaceChild(rendered, viewParent.firstChild);
					else viewParent.appendChild(rendered);
				}
			}
		}
	]);

	// const view = <></>
	const view = fidan.createElement(fidan.Fragment, null, []);

	props['didMount'] = (parent) => {
		viewParent = parent;
	};

	return view;
};
