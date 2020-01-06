function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}
var focused$ = fidan.value(false);
var InputElement1 = fidan.createElement(
  Input,
  _extends(
    {
      focused$: focused$
    },
    InputProps
  )
);
var InputElement2 = fidan.createElement(Input_, {
  value: function _(element) {
    fidan.computed(function _2() {
      element.value = value$.$val;
    }, value$);
  }
});
var InputElement3 = fidan.createElement(Input, {
  value$: fidan.initCompute(function _3() {
    return value$.$val + 1;
  }, value$)
});
var InputElement4 = fidan.createElement(Input_, {
  value: function _4(element) {
    fidan.computed(function _5() {
      element.value = value$.$val + 1;
    }, value$);
  }
});
