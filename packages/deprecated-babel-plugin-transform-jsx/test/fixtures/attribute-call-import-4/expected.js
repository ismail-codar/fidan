var _util = require('./util');
var Main = function Main() {
	var cerceveData$ = fidan.value(null);
	return fidan.createElement(
		Router,
		null,
		fidan.createElement(Route, {
			path: '/',
			component: (0, _util.homePage)(cerceveData$)
		})
	);
};
