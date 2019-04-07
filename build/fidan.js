var fidan = (function (exports) {
  // TODO concat vs..
  function EventedArray(items) {
    var _self = this,
        _array = [],
        _handlers = {
      itemadded: [],
      itemremoved: [],
      itemset: [],
      beforemulti: [],
      aftermulti: []
    };

    function defineIndexProperty(index) {
      if (!(index in _self)) {
        Object.defineProperty(_self, index, {
          configurable: true,
          enumerable: true,
          get: function () {
            return _array[index];
          },
          set: function (v) {
            _array[index] = v;
            raiseEvent({
              type: "itemset",
              index: index,
              item: v
            });
          }
        });
      }
    }

    function raiseEvent(event) {
      _handlers[event.type].forEach(function (h) {
        h.call(_self, event);
      });
    }

    _self.on = function (eventName, handler) {
      _handlers[eventName].push(handler);
    };

    _self.off = function (eventName, handler) {
      var h = _handlers[eventName];
      var ln = h.length;

      while (--ln >= 0) {
        if (h[ln] === handler) {
          h.splice(ln, 1);
        }
      }
    };

    _self.push = function () {
      var arguments$1 = arguments;

      var index;
      arguments.length > 1 && raiseEvent({
        type: "beforemulti"
      });

      for (var i = 0, ln = arguments.length; i < ln; i++) {
        index = _array.length;

        _array.push(arguments$1[i]);

        defineIndexProperty(index);
        raiseEvent({
          type: "itemadded",
          index: index,
          item: arguments$1[i]
        });
      }

      arguments.length > 1 && raiseEvent({
        type: "aftermulti"
      });
      return _array.length;
    };

    _self.pop = function () {
      if (_array.length > -1) {
        var index = _array.length - 1,
            item = _array.pop();

        delete _self[index];
        raiseEvent({
          type: "itemremoved",
          index: index,
          item: item
        });
        return item;
      }
    };

    _self.unshift = function () {
      var arguments$1 = arguments;

      for (var i = 0, ln = arguments.length; i < ln; i++) {
        _array.splice(i, 0, arguments$1[i]);

        defineIndexProperty(_array.length - 1);
        raiseEvent({
          type: "itemadded",
          index: i,
          item: arguments$1[i]
        });
      }

      for (; i < _array.length; i++) {
        raiseEvent({
          type: "itemset",
          index: i,
          item: _array[i]
        });
      }

      return _array.length;
    };

    _self.shift = function () {
      if (_array.length > -1) {
        var item = _array.shift();

        delete _self[_array.length];
        raiseEvent({
          type: "itemremoved",
          index: 0,
          item: item
        });
        return item;
      }
    };

    _self.splice = function (index, howMany
    /*, element1, element2, ... */
    ) {
      var arguments$1 = arguments;

      var removed = [],
          item;
      index = index == null ? 0 : index < 0 ? _array.length + index : index;
      howMany = howMany == null ? _array.length - index : howMany > 0 ? howMany : 0;

      while (howMany--) {
        item = _array.splice(index, 1)[0];
        removed.push(item);
        delete _self[_array.length];
        raiseEvent({
          type: "itemremoved",
          index: index + removed.length - 1,
          item: item
        });
      }

      for (var i = 2, ln = arguments.length; i < ln; i++) {
        _array.splice(index, 0, arguments$1[i]);

        defineIndexProperty(_array.length - 1);
        raiseEvent({
          type: "itemadded",
          index: index,
          item: arguments$1[i]
        });
        index++;
      }

      return removed;
    };

    Object.defineProperty(_self, "length", {
      configurable: false,
      enumerable: false,
      get: function () {
        return _array.length;
      },
      set: function (value) {
        var n = Number(value);
        var length = _array.length;

        if (n % 1 === 0 && n >= 0) {
          if (n < length) {
            _self.splice(n);
          } else if (n > length) {
            _self.push.apply(_self, new Array(n - length));
          }
        } else {
          throw new RangeError("Invalid array length");
        }

        _array.length = n;
        return value;
      }
    });
    Object.defineProperty(_self, "innerArray", {
      configurable: false,
      enumerable: false,
      get: function () {
        return _array;
      },
      set: function (v) {
        _array = v;

        for (var i = 0; i < v.length; i++) {
          defineIndexProperty(i);
        }
      }
    });
    Object.getOwnPropertyNames(Array.prototype).forEach(function (name) {
      if (!(name in _self)) {
        Object.defineProperty(_self, name, {
          configurable: false,
          enumerable: false,
          writable: false,
          value: Array.prototype[name]
        });
      }
    });

    _self.toJSON = function () {
      return _array;
    };

    if (Array.isArray(items)) {
      _self.push.apply(_self, items);
    }
  }

  var value = function (value, freezed) {
    if (value && value["$val"] != undefined) { throw "Fidan: Higher ordered signals is not supported."; }

    var innerFn = function (val) {
      if (val === undefined) {
        return innerFn["$val"];
      } else if (Array.isArray(val)) {
        innerFn["$val"].innerArray = val;
      } else { innerFn["$val"] = val; }

      var depends = innerFn["depends"];
      if (depends.length) { for (var i = 0; i < depends.length; i++) { !depends[i]["freezed"] && depends[i](depends[i].compute()); } }
    };

    innerFn["$val"] = value;
    innerFn["freezed"] = freezed;
    innerFn["depends"] = [];

    innerFn.toString = innerFn.toJSON = function () { return innerFn["$val"].toString(); };

    return innerFn;
  };
  var array = function (items) {
    var arr = value(new EventedArray(items));
    arr.on = arr.$val.on;
    arr.off = arr.$val.off;

    arr.toJSON = function () { return arr.$val.innerArray; };

    return arr;
  };
  var on = function (arr, type, callback) {
    arr["$val"].on(type, callback);
  };
  var off = function (arr, type, callback) {
    arr["$val"].off(type, callback);
  };
  var compute = function (fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var compute = value();
    compute["compute"] = fn;

    for (var i = 0; i < args.length; i++) { args[i]["depends"].push(compute); }

    fn();
  };
  var initCompute = function (fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var cValue = value(fn());
    compute.apply(void 0, [ function () {
      cValue(fn());
    } ].concat( args ));
    return cValue;
  }; // TODO typedCompute, typedValue ...

  var computeReturn = function (fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    return initCompute.apply(void 0, [ fn ].concat( args ));
  };
  var setCompute = function (prev, fn) {
    var args = [], len = arguments.length - 2;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

    destroy(prev);
    return initCompute.apply(void 0, [ prev, fn ].concat( args ));
  };
  var destroy = function (item) {
    delete item["compute"];
    delete item["depends"];
  };

  var insertToDom = function (parentElement, index, itemElement) {
    var typeOf = typeof itemElement;

    if (typeOf === "function") {
      itemElement(parentElement);
    } else {
      if (typeOf !== "object") {
        itemElement = document.createTextNode(itemElement);
      }

      parentElement.insertBefore(itemElement, parentElement.children[index]);
    }
  };
  var arrayMap = function (arr, parentDom, renderReturn) {
    var oArr = arr.$val instanceof EventedArray ? arr.$val : new EventedArray(arr.$val);
    var arrVal = arr.$val;
    var parentRef = null;
    oArr.on("beforemulti", function () {
      if (parentDom.parentNode) {
        parentRef = {
          parent: parentDom,
          next: parentDom.nextElementSibling
        };
        parentDom = document.createDocumentFragment();
      }
    });
    oArr.on("aftermulti", function () {
      if (parentRef) {
        parentRef.parent.insertBefore(parentDom, parentRef.next);
        parentDom = parentRef.parent;
      }
    });
    oArr.on("itemadded", function (e) {
      insertToDom(parentDom, e.index, renderReturn(e.item, e.index));
    });
    oArr.on("itemset", function (e) {
      parentDom.replaceChild(renderReturn(e.item, e.index), parentDom.children.item(e.index));
    });
    oArr.on("itemremoved", function (e) {
      parentDom.removeChild(parentDom.children.item(e.index));
    });
    arr(oArr);

    var arrayComputeRenderAll = function () {
      if (arrVal.length === 0) { parentDom.textContent = ""; }else {
        var itemElement = null;
        var parentFragment = document.createDocumentFragment();
        parentDom.textContent = "";

        for (var i = parentDom.childElementCount; i < arrVal.length; i++) {
          itemElement = renderReturn(arrVal[i], i);

          if (typeof itemElement !== "object") {
            itemElement = document.createTextNode(itemElement);
          }

          parentFragment.insertBefore(itemElement, parentDom.children[i]);
        }

        parentDom.appendChild(parentFragment);
      }
    };

    compute(arrayComputeRenderAll, arr);
  };

  var setDefaults = function (obj, defaults) {
    for (var key in defaults) {
      if (obj[key] === undefined) { obj[key] = defaults[key]; }
    }
  };
  var mapProperty = function (obj, propertyKey, value$) {
    var descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
    if (descr.configurable) { Object.defineProperty(obj, propertyKey, {
      configurable: false,
      enumerable: true,
      get: function () {
        return value$.$val;
      },
      set: value$
    }); }else {
      descr.set["depends"].push(value(function () {
        value$(obj[propertyKey]);
      }));
    }
  };
  var jsRoot = function () {
    var root;

    if (typeof self !== "undefined") {
      root = self;
    } else if (typeof window !== "undefined") {
      root = window;
    } else if (typeof global !== "undefined") {
      root = global;
    } else if (typeof module !== "undefined") {
      root = module;
    } else {
      root = Function("return this")();
    }

    return root;
  };

  var COMMENT_TEXT = 1;
  var COMMENT_DOM = 2;
  var COMMENT_FN = 4;
  var COMMENT_HTM = 8;
  var COMMENT_TEXT_OR_DOM = COMMENT_TEXT | COMMENT_DOM;
  var htmlProps = {
    id: true,
    nodeValue: true,
    textContent: true,
    className: true,
    innerHTML: true,
    innerText: true,
    tabIndex: true,
    value: true
  };
  var _templateMode = false; // TODO kaldırılacak yerine başka bir yöntem geliştirilecek

  var template = document.createElement("template");

  var putCommentToTagStart = function (htm, index, comment) {
    for (var i = index; i >= 0; i--) {
      var item = htm[i];
      var p = item.lastIndexOf("<");

      if (p !== -1) {
        htm[i] = item.substr(0, p) + comment + item.substr(p); // htm[i] =
        //   item.substr(0, p) + comment + item.substr(p, item.lastIndexOf(" ") - p);
        // if (htm[index + 1].substr(0, 1) === '"') {
        //   htm[index + 1] = htm[index + 1].substr(1);
        // }

        break;
      }
    }
  };

  var html = function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var htm = args[0].slice();
    var params = args.slice(1);
    var attributeName = null;
    var i = 0;

    for (var index = 0; index < htm.length; index++) {
      var item = htm[index];
      var param = params[index];

      if (param === undefined) {
        break;
      }

      var isDynamic = param.hasOwnProperty("$val");

      if (isDynamic) {
        if (param["$indexes"] === undefined) {
          param["$indexes"] = [];
        }

        param["$indexes"].push(index);
      }

      if (item.endsWith('="')) {
        i = item.lastIndexOf(" ") + 1;
        attributeName = item.substr(i, item.length - i - 2);
        putCommentToTagStart(htm, index, ("<!-- cmt_" + COMMENT_DOM + "_" + index + "_" + attributeName + " -->"));
      } else {
        var commentType = typeof param === "function" && !isDynamic ? COMMENT_FN : typeof param === "object" ? COMMENT_HTM : COMMENT_TEXT;
        htm[index] = item + "<!-- cmt_" + commentType + "_" + index + " -->";
      }
    }

    template = template.cloneNode(false);
    template.innerHTML = htm.join("");
    var element = template.content;
    element["$params"] = params;

    if (!_templateMode) {
      updateNodesByCommentNodes(element, params);
    }

    return element;
  };

  var walkForCommentNodes = function (element, commentNodes) {
    var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, {
      acceptNode: function (node) {
        var nodeValue = node.nodeValue.trim();
        return nodeValue.startsWith("cmt_") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }, false);

    while (treeWalker.nextNode()) {
      commentNodes.push(treeWalker.currentNode);
    }
  };

  var updateNodesByCommentNodes = function (element, params) {
    var commentNodes = [];
    walkForCommentNodes(element, commentNodes);

    var loop = function ( i ) {
      var commentNode = commentNodes[i];
      var commentValue = commentNode.nodeValue;
      var element$1 = null;
      var attributeName = null;
      var i1 = commentValue.indexOf("_") + 1;
      var i2 = commentValue.indexOf("_", i1);
      var commentType = parseInt(commentValue.substr(i1, i2 - i1));
      i1 = commentValue.indexOf("_", i2) + 1;
      i2 = commentValue.indexOf("_", i1);

      if (i2 === -1) {
        i2 = commentValue.indexOf(" ", i1);
      }

      var paramIndex = parseInt(commentValue.substr(i1, i2 - i1));
      var param = params[paramIndex];

      if (commentType & COMMENT_TEXT_OR_DOM) {
        if (commentType === COMMENT_TEXT) {
          attributeName = "textContent";
          element$1 = document.createTextNode(param.$val);
          commentNode.parentElement.insertBefore(element$1, commentNode.nextSibling);

          if (!param.hasOwnProperty("$val")) {
            if (Array.isArray(param)) {
              for (var p = 0; p < param.length; p++) {
                commentNode.parentElement.appendChild(param[p]);
              }
            }
          }
        } else if (commentType === COMMENT_DOM) {
          attributeName = commentValue.substr(i2 + 1, commentValue.length - i2 - 2);
          element$1 = commentNode.nextElementSibling;
        }

        if (attributeName.startsWith("on")) {
          element$1.addEventListener(attributeName.substr(2), param);
        } else if (param.hasOwnProperty("$val")) {
          if (htmlProps[attributeName]) {
            compute(function () {
              element$1[attributeName] = param.$val;
            }, param);
          } else {
            compute(function () {
              element$1.setAttribute(attributeName, param.$val);
            }, param);
          }
        } else {
          if (htmlProps[attributeName]) {
            element$1[attributeName] = param;
          } else {
            element$1.setAttribute(attributeName, param);
          }
        }
      } else if (commentType === COMMENT_FN) {
        param(commentNode);
      } else if (commentType === COMMENT_HTM) {
        commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
      }
    };

    for (var i = 0; i < commentNodes.length; i++) loop( i );
  };

  var htmlArrayMap = function (arr, renderCallback, useCloneNode) {
    if (Array.isArray(arr)) {
      var oArray = array(arr);
      ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"].forEach(function (method) { return arr[method] = oArray.$val[method]; });
      arr = oArray;
    }

    if (useCloneNode) {
      return function (commentNode) {
        var element = commentNode.parentElement;
        var clonedNode = null;
        var params = null;
        var dataParamIndexes = [];

        var arrayMapFn = function (data, rowIndex) {
          var renderNode = null;

          if (clonedNode === null) {
            _templateMode = true;
            renderNode = renderCallback(data);
            _templateMode = false;
            params = renderNode["$params"];

            for (var key in data) {
              var indexes = data[key]["$indexes"];

              for (var i = 0; i < indexes.length; i++) {
                dataParamIndexes.push(indexes[i], key);
              }
            }

            clonedNode = renderNode.cloneNode(true);
          } else {
            renderNode = clonedNode.cloneNode(true);
          }

          for (var i = 0; i < dataParamIndexes.length; i += 2) {
            params[dataParamIndexes[i]] = data[dataParamIndexes[i + 1]];
          }

          updateNodesByCommentNodes(renderNode, params);
          return renderNode;
        };

        arrayMap(arr, element, arrayMapFn);
      };
    } else {
      return function (commentNode) {
        var element = commentNode.parentElement;
        arrayMap(arr, element, renderCallback);
      };
    }
  };

  exports.value = value;
  exports.array = array;
  exports.on = on;
  exports.off = off;
  exports.compute = compute;
  exports.initCompute = initCompute;
  exports.computeReturn = computeReturn;
  exports.setCompute = setCompute;
  exports.destroy = destroy;
  exports.insertToDom = insertToDom;
  exports.arrayMap = arrayMap;
  exports.setDefaults = setDefaults;
  exports.mapProperty = mapProperty;
  exports.jsRoot = jsRoot;
  exports.html = html;
  exports.htmlArrayMap = htmlArrayMap;

  return exports;

}({}));
