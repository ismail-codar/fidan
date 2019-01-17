import { fidan } from '@fidanjs/runtime';
import { Router } from '../../lib/router';
import { Route } from '../../lib/route';
import { Home } from '../pages/Home';
import { Page1 } from '../pages/Page1';
import { Page2 } from '../pages/Page2';

export const Main = () => {
	return (
		<div>
			<a href="/"> Home </a>
			<a href="/page1"> Page1 </a>
			<a href="/page2"> Page2 </a>
			<hr />
			<Router>
				<Route path="/" component={Home} />
				<Route path="/page1" component={Page1} />
				<Route path="/page2" component={Page2} />
			</Router>
		</div>
	);
};
