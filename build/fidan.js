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

    _self.slice = function (start, end) {
      return new EventedArray(_array.slice(start, end));
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
  var value = function (val, freezed) {
    var innerFn = function (val) {
      if (val === undefined) {
        return innerFn["$next"];
      } else {
        if (Array.isArray(val) || innerFn["$next"] instanceof EventedArray) {
          innerFn["$next"].innerArray = val["slice"](0);
        } else {
          innerFn["$next"] = val;
        }

        var depends = innerFn["depends"];
        if (depends.length) { for (var i = 0; i < depends.length; i++) { !depends[i]["freezed"] && depends[i](depends[i].compute(val, innerFn)); } }

        if (Array.isArray(val) || val instanceof EventedArray) {
          innerFn["$val"].innerArray = val["slice"](0);
        } else { innerFn["$val"] = val; }
      }
    };

    if (Array.isArray(val) || innerFn["$val"] instanceof EventedArray) {
      innerFn["$next"] = val["slice"](0);
      innerFn["$val"] = val["slice"](0);
    } else {
      innerFn["$next"] = val;
      innerFn["$val"] = val;
    }

    innerFn["freezed"] = freezed;
    innerFn["depends"] = [];

    innerFn.toString = innerFn.toJSON = function () { return innerFn["$val"].toString(); };

    return innerFn;
  };
  var computeBy = function (initial, fn) {
    var args = [], len = arguments.length - 2;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

    var cmp = value(undefined);
    cmp["compute"] = fn;
    cmp(fn(initial.$val, cmp));
    args.splice(0, 0, initial);

    for (var i = 0; i < args.length; i++) { args[i]["depends"].push(cmp); }

    return cmp;
  };
  var compute = function (fn) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var cmp = value(undefined);
    cmp["compute"] = fn;
    cmp(fn(undefined, cmp));

    for (var i = 0; i < args.length; i++) { args[i]["depends"].push(cmp); }

    return cmp;
  }; // TODO typedCompute, typedValue ...
  // export const computeReturn = <T>(fn: () => T, ...args: any[]): T =>
  //   initCompute(fn, ...args) as any;
  // export const setCompute = (prev: any, fn: () => void, ...args: any[]) => {
  //   destroy(prev);
  //   return initCompute(prev, fn, ...args);
  // };

  var destroy = function (item) {
    delete item["compute"];
    delete item["depends"];
  };

  // https://github.com/Freak613/stage0/blob/master/reuseNodes.js
  var reuseNodes = function (parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
    if (data.length === 0) {
      if (beforeNode !== undefined || afterNode !== undefined) {
        var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild,
            tmp;
        if (afterNode === undefined) { afterNode = null; }

        while (node !== afterNode) {
          tmp = node.nextSibling;
          parent.removeChild(node);
          node = tmp;
        }
      } else {
        parent.textContent = "";
      }

      return;
    }

    if (renderedValues.length > data.length) {
      var i = renderedValues.length,
          tail = afterNode !== undefined ? afterNode.previousSibling : parent.lastChild,
          tmp$1;

      while (i > data.length) {
        tmp$1 = tail.previousSibling;
        parent.removeChild(tail);
        tail = tmp$1;
        i--;
      }
    }

    var _head = beforeNode ? beforeNode.nextSibling : parent.firstChild;

    if (_head === afterNode) { _head = undefined; }

    var _mode = afterNode ? 1 : 0;

    for (var i$1 = 0, item = (void 0), head = _head, mode = _mode; i$1 < data.length; i$1++) {
      item = data[i$1];

      if (head) {
        noOp(item, renderedValues[i$1]);
      } else {
        head = createFn(item);
        mode ? parent.insertBefore(head, afterNode) : parent.appendChild(head);
      }

      head = head.nextSibling;
      if (head === afterNode) { head = null; }
    }
  };

  // https://github.com/Freak613/stage0/blob/master/reconcile.js
  var reconcile = function (parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
    // Fast path for clear
    if (data.length === 0) {
      if (beforeNode !== undefined || afterNode !== undefined) {
        var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild,
            tmp;
        if (afterNode === undefined) { afterNode = null; }

        while (node !== afterNode) {
          tmp = node.nextSibling;
          parent.removeChild(node);
          node = tmp;
        }
      } else {
        parent.textContent = "";
      }

      return;
    }

    debugger; // Fast path for create

    if (renderedValues.length === 0) {
      var node$1,
          mode = afterNode !== undefined ? 1 : 0;

      for (var i = 0, len = data.length; i < len; i++) {
        node$1 = createFn(data[i]);
        mode ? parent.insertBefore(node$1, afterNode) : parent.appendChild(node$1);
      }

      return;
    }

    var prevStart = 0,
        newStart = 0,
        loop = true,
        prevEnd = renderedValues.length - 1,
        newEnd = data.length - 1,
        a,
        b,
        prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstChild,
        newStartNode = prevStartNode,
        prevEndNode = afterNode ? afterNode.previousSibling : parent.lastChild,
        newEndNode = prevEndNode;

    fixes: while (loop) {
      loop = false;

      var _node = (void 0); // Skip prefix


      a = renderedValues[prevStart], b = data[newStart];

      while (a === b) {
        noOp(b, a);
        prevStart++;
        newStart++;
        newStartNode = prevStartNode = prevStartNode.nextSibling;
        if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
        a = renderedValues[prevStart];
        b = data[newStart];
      } // Skip suffix


      a = renderedValues[prevEnd], b = data[newEnd];

      while (a === b) {
        noOp(b, a);
        prevEnd--;
        newEnd--;
        afterNode = prevEndNode;
        newEndNode = prevEndNode = prevEndNode.previousSibling;
        if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
        a = renderedValues[prevEnd];
        b = data[newEnd];
      } // Fast path to swap backward


      a = renderedValues[prevEnd], b = data[newStart];

      while (a === b) {
        loop = true;
        noOp(b, a);
        _node = prevEndNode.previousSibling;
        parent.insertBefore(prevEndNode, newStartNode);
        newEndNode = prevEndNode = _node;
        newStart++;
        prevEnd--;
        if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
        a = renderedValues[prevEnd];
        b = data[newStart];
      } // Fast path to swap forward


      a = renderedValues[prevStart], b = data[newEnd];

      while (a === b) {
        loop = true;
        noOp(b, a);
        _node = prevStartNode.nextSibling;
        parent.insertBefore(prevStartNode, afterNode);
        prevStart++;
        afterNode = newEndNode = prevStartNode;
        prevStartNode = _node;
        newEnd--;
        if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
        a = renderedValues[prevStart];
        b = data[newEnd];
      }
    } // Fast path for shrink


    if (newEnd < newStart) {
      if (prevStart <= prevEnd) {
        var next;

        while (prevStart <= prevEnd) {
          if (prevEnd === 0) {
            parent.removeChild(prevEndNode);
          } else {
            next = prevEndNode.previousSibling;
            parent.removeChild(prevEndNode);
            prevEndNode = next;
          }

          prevEnd--;
        }
      }

      return;
    } // Fast path for add


    if (prevEnd < prevStart) {
      if (newStart <= newEnd) {
        var node$2,
            mode$1 = afterNode ? 1 : 0;

        while (newStart <= newEnd) {
          node$2 = createFn(data[newStart]);
          mode$1 ? parent.insertBefore(node$2, afterNode) : parent.appendChild(node$2);
          newStart++;
        }
      }

      return;
    } // Positions for reusing nodes from current DOM state


    var P = new Array(newEnd + 1 - newStart);

    for (var i$1 = newStart; i$1 <= newEnd; i$1++) { P[i$1] = -1; } // Index to resolve position from current to new


    var I = new Map();

    for (var i$2 = newStart; i$2 <= newEnd; i$2++) { I.set(data[i$2], i$2); }

    var reusingNodes = newStart + data.length - 1 - newEnd,
        toRemove = [];

    for (var i$3 = prevStart; i$3 <= prevEnd; i$3++) {
      if (I.has(renderedValues[i$3])) {
        P[I.get(renderedValues[i$3])] = i$3;
        reusingNodes++;
      } else {
        toRemove.push(i$3);
      }
    } // Fast path for full replace


    if (reusingNodes === 0) {
      if (beforeNode !== undefined || afterNode !== undefined) {
        var node$3 = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild,
            tmp$1;
        if (afterNode === undefined) { afterNode = null; }

        while (node$3 !== afterNode) {
          tmp$1 = node$3.nextSibling;
          parent.removeChild(node$3);
          node$3 = tmp$1;
          prevStart++;
        }
      } else {
        parent.textContent = "";
      }

      var node$4,
          mode$2 = afterNode ? 1 : 0;

      for (var i$4 = newStart; i$4 <= newEnd; i$4++) {
        node$4 = createFn(data[i$4]);
        mode$2 ? parent.insertBefore(node$4, afterNode) : parent.appendChild(node$4);
      }

      return;
    } // What else?


    var longestSeq = longestPositiveIncreasingSubsequence(P, newStart); // Collect nodes to work with them

    var nodes = [];
    var tmpC = prevStartNode;

    for (var i$5 = prevStart; i$5 <= prevEnd; i$5++) {
      nodes[i$5] = tmpC;
      tmpC = tmpC.nextSibling;
    }

    for (var i$6 = 0; i$6 < toRemove.length; i$6++) { parent.removeChild(nodes[toRemove[i$6]]); }

    var lisIdx = longestSeq.length - 1,
        tmpD;

    for (var i$7 = newEnd; i$7 >= newStart; i$7--) {
      if (longestSeq[lisIdx] === i$7) {
        afterNode = nodes[P[longestSeq[lisIdx]]];
        noOp(data[i$7], renderedValues[i$7]);
        lisIdx--;
      } else {
        if (P[i$7] === -1) {
          tmpD = createFn(data[i$7]);
        } else {
          tmpD = nodes[P[i$7]];
          noOp(data[i$7], renderedValues[i$7]);
        }

        parent.insertBefore(tmpD, afterNode);
        afterNode = tmpD;
      }
    }
  };
  // https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368
  // return an array of the indices of ns that comprise the longest increasing subsequence within ns

  function longestPositiveIncreasingSubsequence(ns, newStart) {
    var seq = [],
        is = [],
        l = -1,
        pre = new Array(ns.length);

    for (var i = newStart, len = ns.length; i < len; i++) {
      var n = ns[i];
      if (n < 0) { continue; }
      var j = findGreatestIndexLEQ(seq, n);
      if (j !== -1) { pre[i] = is[j]; }

      if (j === l) {
        l++;
        seq[l] = n;
        is[l] = i;
      } else if (n < seq[j + 1]) {
        seq[j + 1] = n;
        is[j + 1] = i;
      }
    }

    for (i = is[l]; l >= 0; i = pre[i], l--) {
      seq[l] = i;
    }

    return seq;
  }

  function findGreatestIndexLEQ(seq, n) {
    // invariant: lo is guaranteed to be index of a value <= n, hi to be >
    // therefore, they actually start out of range: (-1, last + 1)
    var lo = -1,
        hi = seq.length; // fast path for simple increasing sequences

    if (hi > 0 && seq[hi - 1] <= n) { return hi - 1; }

    while (hi - lo > 1) {
      var mid = Math.floor((lo + hi) / 2);

      if (seq[mid] > n) {
        hi = mid;
      } else {
        lo = mid;
      }
    }

    return lo;
  }

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
  var arrayMap = function (arr, parentDom, renderReturn, renderMode) {
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
    var firstRenderOnFragment = undefined;

    var arrayComputeRenderAll = function (nextVal) {
      if (!renderMode) {
        var parentFragment = document.createDocumentFragment();
        parentDom.textContent = "";

        for (var i = 0; i < arr.$val.length; i++) {
          insertToDom(parentFragment, i, renderReturn(arr.$val[i], i));
        }

        parentDom.appendChild(parentFragment);
      } else {
        if (firstRenderOnFragment === undefined && nextVal && nextVal.length > 0) { firstRenderOnFragment = document.createDocumentFragment(); }
        var renderFunction = renderMode === "reconcile" ? reconcile : reuseNodes;
        debugger;
        renderFunction(parentDom, // firstRenderOnFragment || parentDom
        arrVal["innerArray"], nextVal || [], function (nextItem) {
          return renderReturn(nextItem);
        }, function (nextItem, prevItem) {
          for (var key in nextItem) {
            if (prevItem[key].hasOwnProperty("$val")) {
              nextItem[key].depends = prevItem[key].depends;
              prevItem[key](nextItem[key]());
            }
          }
        });

        if (firstRenderOnFragment) {
          parentDom.appendChild(firstRenderOnFragment);
          firstRenderOnFragment = null;
        }
      }
    };

    computeBy(arr, arrayComputeRenderAll);
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
            computeBy(param, function (val) {
              element$1[attributeName] = val;
            })["name$"] = "[" + attributeName + "]";
          } else {
            computeBy(param, function (val) {
              element$1.setAttribute(attributeName, val);
            })["name$"] = "attr(" + attributeName + ")";
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

  var htmlArrayMap = function (arr, renderCallback, options) {
    if ( options === void 0 ) options = {
    useCloneNode: false,
    renderMode: undefined
  };

    // if (Array.isArray(arr)) {
    //   const oArray = array(arr);
    //   [
    //     "copyWithin",
    //     "fill",
    //     "pop",
    //     "push",
    //     "reverse",
    //     "shift",
    //     "sort",
    //     "splice",
    //     "unshift"
    //   ].forEach(method => (arr[method] = oArray.$val[method]));
    //   arr = oArray;
    // }
    if (options.useCloneNode) {
      return function (commentNode) {
        var element = commentNode.parentElement;
        var clonedNode = null;
        var params = null;
        var dataParamIndexes = [];

        var arrayMapFn = function (data) {
          var renderNode = null;

          if (clonedNode === null) {
            _templateMode = true;
            renderNode = renderCallback(data);
            _templateMode = false;
            params = renderNode["$params"];

            for (var key in data) {
              var indexes = data[key]["$indexes"];
              if (indexes) { for (var i = 0; i < indexes.length; i++) {
                dataParamIndexes.push(indexes[i], key);
              } }
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

        arrayMap(arr, element, arrayMapFn, options.renderMode);
      };
    } else {
      return function (commentNode) {
        var element = commentNode.parentElement;
        arrayMap(arr, element, renderCallback);
      };
    }
  };

  exports.array = array;
  exports.on = on;
  exports.off = off;
  exports.value = value;
  exports.computeBy = computeBy;
  exports.compute = compute;
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
