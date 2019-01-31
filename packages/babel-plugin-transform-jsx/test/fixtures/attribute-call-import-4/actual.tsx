import { homePage } from './util';

const Main = () => {
	let cerceveData$ = null;

	return (
		<Router>
			<Route path="/" component={homePage(cerceveData$)} />
		</Router>
	);
};
