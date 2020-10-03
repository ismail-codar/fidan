var simpleMutationMethods = ['pop', 'push', 'shift', 'splice', 'unshift'];
var complexMutationMethods = ['copyWithin', 'fill', 'reverse', 'sort'];
var mutationMethods = simpleMutationMethods.concat(complexMutationMethods);
var autoTracks = null;
var value = function value(val) {
  if (val && val.hasOwnProperty('$val')) return val;

  var innerFn = function innerFn(val, opt) {
    if (val === undefined) {
      if (autoTracks && autoTracks.indexOf(innerFn) === -1) autoTracks.push(innerFn);
      return innerFn['$val'];
    } else {
      var updateAfter = Array.isArray(val);

      if (!updateAfter) {
        innerFn['$val'] = val;
      }

      var depends = innerFn['c_depends'];
      if (depends.length) for (var i = 0; i < depends.length; i++) {
        if (depends[i].compute) {
          depends[i](depends[i].compute(val, {
            caller: innerFn
          }), {
            caller: depends[i]
          });
        } else {
          depends[i](innerFn.$val, innerFn);
        }
      }

      if (updateAfter) {
        innerFn['$val'] = val;
        createFidanArray(innerFn);
      }
    }
  };

  innerFn['$val'] = val;
  innerFn['c_depends'] = [];

  innerFn.debugName = function (name) {
    Object.defineProperty(innerFn, 'name', {
      value: name
    });
    return innerFn;
  };

  innerFn.toString = innerFn.toJSON = function () {
    return innerFn['$val'] && innerFn['$val'].toJSON ? innerFn['$val'].toJSON() : innerFn['$val'];
  };

  innerFn.depends = function () {
    var deps = [].slice.call(arguments);

    for (var i = 0; i < deps.length; i++) {
      innerFn['c_depends'].push(deps[i]);
    }

    innerFn(innerFn()); //trigger to c_depends

    return innerFn;
  };

  if (Array.isArray(val)) {
    innerFn['map'] = function (renderFn, renderMode) {
      return {
        arr: innerFn,
        renderFn: renderFn,
        renderMode: renderMode
      };
    };
  }

  return innerFn;
};
var computed = function computed(fn, dependencies) {
  autoTracks = dependencies ? null : [];
  var cmp = value(undefined);
  var val = fn(undefined, {
    caller: cmp
  });
  cmp.$val = val;

  if (Array.isArray(val)) {
    createFidanArray(cmp);
  }

  var deps = autoTracks ? autoTracks : dependencies;
  autoTracks = null;
  cmp['compute'] = fn;

  for (var i = 0; i < deps.length; i++) {
    deps[i]['c_depends'].push(cmp);
  }

  return cmp;
};
var createFidanArray = function createFidanArray(dataArray) {
  if (dataArray.$val['$overrided']) return;
  dataArray.$val['$overrided'] = true;
  if (!dataArray.size) dataArray.size = value(dataArray.$val.length);else dataArray.size(dataArray.$val.length);
  Object.assign(dataArray, dataArray.$val);
  Object.defineProperty(dataArray, 'length', {
    configurable: false,
    enumerable: true,
    get: function get() {
      return dataArray.$val.length;
    },
    set: function set(v) {
      return dataArray.$val.length = v;
    }
  });
  mutationMethods.forEach(function (method) {
    dataArray[method] = function () {
      var arr = dataArray.$val.slice(0);
      var size1 = arr.length;
      var ret = Array.prototype[method].apply(arr, arguments);
      var size2 = arr.length;
      if (size1 !== size2) dataArray.size(size2); // TODO event based strategy for -> simpleMutationMethods

      dataArray(arr, {
        method: method,
        caller: dataArray,
        args: Array.prototype.slice.call(arguments)
      });
      return ret;
    };
  });
};

var injectToProperty = function injectToProperty(obj, propertyKey, val) {
  // const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
  // if (descr.configurable)
  Object.defineProperty(obj, propertyKey, {
    configurable: true,
    enumerable: true,
    get: function get() {
      val();
      return val;
    },
    set: function set(v) {
      return v.hasOwnProperty('$val') ? val = v : val(v);
    }
  }); // else {
  //   // descr.get().c_depends.push(val);
  //   // val["c_depends"].push(descr.get());
  // }
};
var inject = function inject(obj) {
  for (var key in obj) {
    injectToProperty(obj, key, value(obj[key]));
  }

  return obj;
};
var debounce = function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;

    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Original: https://github.com/Freak613/stage0/blob/master/reconcile.js
function reconcile(parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
  // Fast path for clear
  if (data.length === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstElementChild,
          tmp;
      if (afterNode === undefined) afterNode = null;

      while (node && node !== afterNode) {
        tmp = node.nextSibling;
        parent.removeChild(node);
        node = tmp;
      }
    } else {
      parent.textContent = '';
    }

    return;
  } // Fast path for create


  if (renderedValues.length === 0) {
    var _node2,
        mode = afterNode !== undefined ? 1 : 0;

    for (var i = 0, len = data.length; i < len; i++) {
      _node2 = createFn(data[i], i);
      mode ? parent.insertBefore(_node2, afterNode) : parent.appendChild(_node2);
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
      prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstElementChild,
      newStartNode = prevStartNode,
      prevEndNode = afterNode ? afterNode.previousSibling : parent.lastElementChild,
      newEndNode = prevEndNode;

  fixes: while (loop) {
    loop = false;

    var _node = void 0; // Skip prefix


    a = renderedValues[prevStart], b = data[newStart];

    while (a === b) {
      noOp(prevStartNode, b);
      prevStart++;
      newStart++;
      newStartNode = prevStartNode = prevStartNode.nextSibling;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevStart];
      b = data[newStart];
    } // Skip suffix


    a = renderedValues[prevEnd], b = data[newEnd];

    while (a === b) {
      noOp(prevEndNode, b);
      prevEnd--;
      newEnd--;
      afterNode = prevEndNode;
      newEndNode = prevEndNode = prevEndNode.previousSibling;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevEnd];
      b = data[newEnd];
    } // Fast path to swap backward


    a = renderedValues[prevEnd], b = data[newStart];

    while (a === b) {
      loop = true;
      noOp(prevEndNode, b);
      _node = prevEndNode.previousSibling;
      parent.insertBefore(prevEndNode, newStartNode);
      newEndNode = prevEndNode = _node;
      newStart++;
      prevEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedValues[prevEnd];
      b = data[newStart];
    } // Fast path to swap forward


    a = renderedValues[prevStart], b = data[newEnd];

    while (a === b) {
      loop = true;
      noOp(prevStartNode, b);
      _node = prevStartNode.nextSibling;
      parent.insertBefore(prevStartNode, afterNode);
      prevStart++;
      afterNode = newEndNode = prevStartNode;
      prevStartNode = _node;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
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
      var _node3,
          _mode = afterNode ? 1 : 0;

      while (newStart <= newEnd) {
        _node3 = createFn(data[newStart], newStart);
        _mode ? parent.insertBefore(_node3, afterNode) : parent.appendChild(_node3);
        newStart++;
      }
    }

    return;
  } // Positions for reusing nodes from current DOM state


  var P = new Array(newEnd + 1 - newStart);

  for (var _i = newStart; _i <= newEnd; _i++) {
    P[_i] = -1;
  } // Index to resolve position from current to new


  var I = new Map();

  for (var _i2 = newStart; _i2 <= newEnd; _i2++) {
    I.set(data[_i2], _i2);
  }

  var reusingNodes = newStart + data.length - 1 - newEnd,
      toRemove = [];

  for (var _i3 = prevStart; _i3 <= prevEnd; _i3++) {
    if (I.has(renderedValues[_i3])) {
      P[I.get(renderedValues[_i3])] = _i3;
      reusingNodes++;
    } else {
      toRemove.push(_i3);
    }
  } // Fast path for full replace


  if (reusingNodes === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      var _node5 = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstElementChild,
          _tmp;

      if (afterNode === undefined) afterNode = null;

      while (_node5 !== afterNode) {
        _tmp = _node5.nextSibling;
        parent.removeChild(_node5);
        _node5 = _tmp;
        prevStart++;
      }
    } else {
      parent.textContent = '';
    }

    var _node4,
        _mode2 = afterNode ? 1 : 0;

    for (var _i4 = newStart; _i4 <= newEnd; _i4++) {
      _node4 = createFn(data[_i4], _i4);
      _mode2 ? parent.insertBefore(_node4, afterNode) : parent.appendChild(_node4);
    }

    return;
  } // What else?


  var longestSeq = longestPositiveIncreasingSubsequence(P, newStart); // Collect nodes to work with them

  var nodes = [];
  var tmpC = prevStartNode;

  for (var _i5 = prevStart; _i5 <= prevEnd; _i5++) {
    nodes[_i5] = tmpC;
    tmpC = tmpC.nextSibling;
  }

  for (var _i6 = 0; _i6 < toRemove.length; _i6++) {
    parent.removeChild(nodes[toRemove[_i6]]);
  }

  var lisIdx = longestSeq.length - 1,
      tmpD;

  for (var _i7 = newEnd; _i7 >= newStart; _i7--) {
    if (longestSeq[lisIdx] === _i7) {
      afterNode = nodes[P[longestSeq[lisIdx]]];
      noOp(afterNode, data[_i7]);
      lisIdx--;
    } else {
      if (P[_i7] === -1) {
        tmpD = createFn(data[_i7], _i7);
      } else {
        tmpD = nodes[P[_i7]];
        noOp(tmpD, data[_i7]);
      }

      parent.insertBefore(tmpD, afterNode);
      afterNode = tmpD;
    }
  }
}
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368
// return an array of the indices of ns that comprise the longest increasing subsequence within ns

function longestPositiveIncreasingSubsequence(ns, newStart) {
  var seq = [],
      is = [],
      l = -1,
      pre = new Array(ns.length);

  for (var i = newStart, len = ns.length; i < len; i++) {
    var n = ns[i];
    if (n < 0) continue;
    var j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];

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

  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

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

// Original: https://github.com/Freak613/stage0/blob/master/reuseNodes.js
var reuseNodes = function reuseNodes(parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
  if (data.length === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild,
          tmp;
      if (afterNode === undefined) afterNode = null;

      while (node && node !== afterNode) {
        tmp = node.nextSibling;
        parent.removeChild(node);
        node = tmp;
      }
    } else {
      parent.textContent = '';
    }

    return;
  }

  if (renderedValues.length > data.length) {
    var i = renderedValues.length,
        tail = afterNode !== undefined ? afterNode.previousSibling : parent.lastChild,
        _tmp;

    while (i > data.length) {
      _tmp = tail.previousSibling;
      parent.removeChild(tail);
      tail = _tmp;
      i--;
    }
  }

  var _head = beforeNode ? beforeNode.nextSibling : parent.firstChild;

  if (_head === afterNode) _head = undefined;

  var _mode = afterNode ? 1 : 0;

  for (var _i = 0, item, head = _head, mode = _mode; _i < data.length; _i++) {
    item = data[_i];

    if (head) {
      noOp(item, renderedValues[_i]);
    } else {
      head = createFn(item, _i);
      mode ? parent.insertBefore(head, afterNode) : parent.appendChild(head);
    }

    head = head.nextSibling;
    if (head === afterNode) head = null;
  }
};

// https://github.com/ismail-codar/fidan/blob/master/src/html.ts
var TEXT = 1;
var DOM = 2;
var FN = 4; // "function" && !isDynamic

var HTM = 8;
var ARRAY = 16;
var TEXT_OR_DOM = TEXT | DOM;
var htmlProps = {
  id: true,
  nodeValue: true,
  textContent: true,
  className: true,
  innerHTML: true,
  innerText: true,
  tabIndex: true,
  value: true,
  checked: true,
  disabled: true,
  readonly: true,
  contentEditable: true
};
var template = document.createElement('template');
var html = function html(literals) {
  var vars = [].slice.call(arguments, 1);
  var raw = literals.raw,
      result = '',
      i = 0,
      len = vars.length,
      str = '';

  while (i < len) {
    str = raw[i];

    if (str.startsWith('"')) {
      str = str.substr(1);
    }

    if (raw[i].endsWith('="')) {
      //attributes
      var p = str.lastIndexOf(' ') + 1;
      var attr = str.substr(p, str.length - p - 2);
      p = str.lastIndexOf('<');
      var comment = '<!--$cmt_' + attr + '-->';

      if (p === -1) {
        //next attributes
        p = result.lastIndexOf('<');
        result = result.substr(0, p) + comment + result.substr(p) + str.substr(0, str.length - attr.length - 3).trim();
      } else {
        // fist attribute
        result += str.substr(0, p) + comment + str.substr(p, str.length - p - attr.length - 3).trim();
      }
    } else {
      //text nodes
      result += str + '<!--$cmt' + '-->';
    }

    i++;
  }

  var extra = raw[raw.length - 1];

  if (extra.startsWith('"')) {
    extra = extra.substr(1);
  }

  result += extra;
  template = template.cloneNode(false);
  template.innerHTML = result;
  var element = template.content;
  var commentNodes = [];
  walkForCommentNodes(element, commentNodes);
  updateNodesByCommentNodes(commentNodes, vars);
  return element;
};

var walkForCommentNodes = function walkForCommentNodes(element, commentNodes) {
  var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, {
    acceptNode: function acceptNode(node) {
      var nodeValue = node.nodeValue.trim();
      return nodeValue.startsWith('$cmt') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }, false);

  while (treeWalker.nextNode()) {
    commentNodes.push(treeWalker.currentNode);
  }
};

var updateNodesByCommentNodes = function updateNodesByCommentNodes(commentNodes, params) {
  var _loop = function _loop() {
    var commentNode = commentNodes[i];
    commentValue = commentNode.nodeValue;
    var element = null;
    var attributeName = null;
    var param = params[i];
    var isDynamic = param && param.hasOwnProperty('$val');
    var attrIdx = commentValue.indexOf('_');
    var paramType = attrIdx !== -1 ? DOM : typeof param === 'function' && !isDynamic ? FN : Array.isArray(param) ? ARRAY : typeof param === 'object' && param ? HTM : TEXT;

    if (paramType & TEXT_OR_DOM) {
      if (paramType === TEXT) {
        attributeName = 'textContent';
        element = document.createTextNode(isDynamic ? param.$val : param);
        commentNode.parentElement.insertBefore(element, commentNode.nextSibling);

        if (!isDynamic) {
          if (Array.isArray(param)) {
            for (p = 0; p < param.length; p++) {
              commentNode.parentElement.appendChild(param[p]);
            }
          }
        }
      } else if (paramType === DOM) {
        attributeName = commentValue.substr(attrIdx + 1);
        element = commentNode.nextElementSibling;
      }

      paramType !== FN && commentNode.remove();

      if (attributeName.startsWith('on')) {
        element.addEventListener(attributeName.substr(2), param);
      } else if (isDynamic) {
        if (htmlProps[attributeName]) {
          computed(function () {
            element[attributeName] = param();
          }, [param]);
        } else {
          computed(function () {
            element.setAttribute(attributeName, param());
          }, [param]);
        }
      } else {
        if (htmlProps[attributeName]) {
          element[attributeName] = param;
        } else if (typeof param === 'function') {
          param(element);
        } else {
          element.setAttribute(attributeName, param);
        }
      }
    } else if (paramType === FN) {
      if (commentNode.parentElement) {
        param(commentNode.parentElement, commentNode.nextElementSibling);
        commentNode.remove();
      } else {
        //conditionalDom can be place on root
        window.requestAnimationFrame(function () {
          param(commentNode.parentElement, commentNode.nextElementSibling);
          commentNode.remove();
        });
      }
    } else if (paramType === ARRAY) {
      var fragment = document.createDocumentFragment();
      param.forEach(function (p) {
        fragment.appendChild(p);
      });
      commentNode.parentElement.insertBefore(fragment, commentNode.nextSibling);
    } else if (paramType === HTM) {
      if (param.renderFn) {
        arrayMap(param.arr, commentNode.parentElement, commentNode.nextSibling, param.renderFn, param.renderMode);
      } else {
        commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
      }
    }
  };

  for (var i = 0; i < commentNodes.length; i++) {
    var commentValue;
    var p;

    _loop();
  }
};

var arrayMap = function arrayMap(arr, parentDom, nextElement, renderCallback, renderMode) {
  if (renderMode === void 0) {
    renderMode = 'reconcile';
  }

  var prevElement = nextElement ? document.createTextNode('') : undefined;
  nextElement && parentDom.insertBefore(prevElement, nextElement);
  computed(function (nextVal, _ref) {
    var caller = _ref.caller;
    var beforeVal = caller.$val;
    var renderFunction = renderMode === 'reconcile' ? reconcile : reuseNodes;
    renderFunction(parentDom, beforeVal || [], nextVal || [], function (nextItem, index) {
      var rendered = renderCallback(nextItem, index);
      return rendered instanceof Node ? rendered : document.createTextNode(rendered);
    }, function () {}, prevElement, nextElement);
  }, [arr]);
  var nextVal = arr.$val.slice(0);
  arr.$val = [];
  arr(nextVal);
};

exports.arrayMap = arrayMap;
exports.computed = computed;
exports.createFidanArray = createFidanArray;
exports.debounce = debounce;
exports.html = html;
exports.htmlProps = htmlProps;
exports.inject = inject;
exports.injectToProperty = injectToProperty;
exports.value = value;
//# sourceMappingURL=index.js.map
