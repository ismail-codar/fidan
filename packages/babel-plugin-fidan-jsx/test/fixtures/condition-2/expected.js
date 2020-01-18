const _tmpl$ = document.createElement('template');
_tmpl$.innerHTML = '<!--2-->';
var Main = function Main(props) {
	return (function() {
		var _el$ = _tmpl$.content.cloneNode(true),
			_el$2 = _el$.firstChild;
		_r$.conditional(
			_el$,
			{
				test: function test() {
					return size();
				},
				consequent: function consequent() {
					return 'More';
				},
				alternate: function alternate() {
					return 'One';
				}
			},
			null,
			_el$2
		);
		_el$.$props = props;
		return _el$;
	})();
};
