import { fidan } from '@fidanjs/runtime';
import { instance } from './router';

export const Route = (props: { exact?: boolean; path: string; component: (props) => Element }) => {
	let viewParent: Element = null;

	instance.add([
		{
			path: props.path,
			handler: () => {
				fidan.activateContext(props['$context']);
				const rendered = props.component(props);
				fidan.deactivateContext(props['$context']);
				if (viewParent.firstChild) viewParent.replaceChild(rendered, viewParent.firstChild);
				else viewParent.appendChild(rendered);
			}
		}
	]);

	// const view = <></>
	debugger;
	console.log('xxxxx', fidan);
	const view = fidan.createElement(fidan.Fragment, null, []);

	props['didMount'] = (parent) => {
		viewParent = parent;
	};

	return view;
};
