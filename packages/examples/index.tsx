import { createElement } from '@fidan/runtime';
import { Main } from './views/Main';
global['fidan'] = createElement;

const mainView = <Main />;

if (process.env.NODE_ENV === 'development') {
	if (module['hot']) {
		module['hot'].dispose(() => {
			document.body.removeChild(mainView);
		});
	}
}

document.body.appendChild(mainView);
