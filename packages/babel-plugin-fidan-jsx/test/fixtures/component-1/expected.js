Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.Main = void 0;
const _tmpl$2 = document.createElement('template');
_tmpl$2.innerHTML = '<div></div>';
const _tmpl$ = document.createElement('template');
_tmpl$.innerHTML = ' Home ';
var Main = function Main() {
	return (function() {
		var _el$ = _tmpl$2.content.firstChild.cloneNode(true);
		_r$.insert(
			_el$,
			runtime.Link({
				to: '/',
				children: _tmpl$.content.firstChild.cloneNode(true)
			})
		);
		return _el$;
	})();
};
exports.Main = Main;
