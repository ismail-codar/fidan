const _tmpl$4 = document.createElement("template");
_tmpl$4.innerHTML = "<div><!--8--><!--10--><!--11--></div>";
const _tmpl$3 = document.createElement("template");
_tmpl$3.innerHTML = "<div></div>";
const _tmpl$2 = document.createElement("template");
_tmpl$2.innerHTML = "<div>From Parent</div>";
const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML = "<div>Hello <!--4--></div><div></div>";
var Child = function Child(props) {
  return (function() {
    var _el$ = _tmpl$.content.cloneNode(true),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild,
      _el$4 = _el$3.nextSibling,
      _el$5 = _el$2.nextSibling;
    props.ref && props.ref(_el$2);
    _r$.insert(_el$2, props.name, null, _el$4);
    _r$.insert(_el$5, props.children);
    _el$.$props = props;
    return _el$;
  })();
};
var someProps = {
  some: "stuff",
  more: "things"
};
var template = function template(props) {
  var childRef;
  return (function() {
    var _el$6 = _tmpl$4.content.firstChild.cloneNode(true),
      _el$8 = _el$6.firstChild,
      _el$10 = _el$8.nextSibling,
      _el$11 = _el$10.nextSibling;
    _r$.insert(
      _el$6,
      Child(
        Object.assign(
          {
            name: "John"
          },
          props,
          {
            ref: function ref(ref$) {
              return (childRef = ref$);
            },
            children: [_tmpl$2.content.firstChild.cloneNode(true)]
          }
        )
      ),
      null,
      _el$8
    );
    _r$.insert(
      _el$6,
      Child(
        Object.assign(
          {
            name: "Jason"
          },
          props,
          {
            ref: props.ref,
            children: [
              (function() {
                var _el$9 = _tmpl$3.content.firstChild.cloneNode(true);
                _r$.insert(_el$9, state.content);
                return _el$9;
              })()
            ]
          }
        )
      ),
      null,
      _el$10
    );
    _r$.insert(
      _el$6,
      Context.Consumer({
        children: [
          function(context) {
            return context;
          }
        ]
      }),
      null,
      _el$11
    );
    return _el$6;
  })();
};
var template2 = Child({
  name: "Jake",
  dynamic: state.data,
  handleClick: clickHandler
});
