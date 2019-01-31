var homePage = function homePage(data$) {
	return fidan.createElement('div', null, 'home');
};
fidan.createElement(Route, {
	path: '/',
	component: homePage(data$)
});
