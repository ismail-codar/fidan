Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.Main = void 0;
var _ProgressCircular = require('../../components/vue/vuetify/VProgressCircular/ProgressCircular');
var Main = function Main() {
	var value$ = fidan.value(10);
	return fidan.createElement(
		'div',
		null,
		fidan.createElement(_ProgressCircular.ProgressCircular, {
			value$: value$
		})
	);
};
exports.Main = Main;
