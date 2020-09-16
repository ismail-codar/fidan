var fidan = (function (exports) {
	var autoTracks = null;
	var value = function (val) {
	  if (val && val.hasOwnProperty('$val')) { return val; }

	  var innerFn = function (val, opt) {
	    if (val === undefined) {
	      if (autoTracks && autoTracks.indexOf(innerFn) === -1) { autoTracks.push(innerFn); }
	      return innerFn['$val'];
	    } else {
	      var updateAfter = Array.isArray(val);
	      if (!updateAfter) { innerFn['$val'] = val; }
	      var depends = innerFn['c_depends'];
	      if (depends.length) { for (var i = 0; i < depends.length; i++) {
	        if (depends[i].compute) {
	          depends[i](depends[i].compute(val, {
	            caller: innerFn
	          }), {
	            caller: depends[i]
	          });
	        } else {
	          depends[i](innerFn.$val, innerFn);
	        }
	      } }
	      if (updateAfter) { innerFn['$val'] = val; }
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

	  innerFn.toString = innerFn.toJSON = function () { return innerFn['$val'] && innerFn['$val'].toJSON ? innerFn['$val'].toJSON() : innerFn['$val']; };

	  innerFn.depends = function () {
	    var deps = [], len = arguments.length;
	    while ( len-- ) deps[ len ] = arguments[ len ];

	    for (var i = 0; i < deps.length; i++) { innerFn['c_depends'].push(deps[i]); }

	    innerFn(innerFn()); //trigger to c_depends

	    return innerFn;
	  };

	  if (Array.isArray(val)) {
	    innerFn['map'] = function (renderFn, renderMode) { return ({
	      arr: innerFn,
	      renderFn: renderFn,
	      renderMode: renderMode
	    }); };
	  }

	  return innerFn;
	};
	var computed = function (fn, dependencies) {
	  autoTracks = dependencies ? null : [];
	  var cmp = value(undefined);
	  var val = fn(undefined, {
	    caller: cmp
	  });
	  cmp.$val = val;
	  var deps = autoTracks ? autoTracks : dependencies;
	  autoTracks = null;
	  cmp['compute'] = fn;

	  for (var i = 0; i < deps.length; i++) { deps[i]['c_depends'].push(cmp); }

	  return cmp;
	};

	var injectToProperty = function (obj, propertyKey, val) {
	  // const descr = Object.getOwnPropertyDescriptor(obj, propertyKey);
	  // if (descr.configurable)
	  Object.defineProperty(obj, propertyKey, {
	    configurable: true,
	    enumerable: true,
	    get: function () {
	      val();
	      return val;
	    },
	    set: function (v) { return v.hasOwnProperty('$val') ? val = v : val(v); }
	  }); // else {
	  //   // descr.get().c_depends.push(val);
	  //   // val["c_depends"].push(descr.get());
	  // }
	};
	var inject = function (obj) {
	  for (var key in obj) {
	    injectToProperty(obj, key, value(obj[key]));
	  }

	  return obj;
	};
	var debounce = function (func, wait, immediate) {
	  var timeout;
	  return function () {
	    var context = this;
	    var args = arguments;

	    var later = function () {
	      timeout = null;
	      if (!immediate) { func.apply(context, args); }
	    };

	    var callNow = immediate && !timeout;
	    clearTimeout(timeout);
	    timeout = setTimeout(later, wait);
	    if (callNow) { func.apply(context, args); }
	  };
	};

	// Original: https://github.com/Freak613/stage0/blob/master/reconcile.js
	function reconcile(parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
	  // Fast path for clear
	  if (data.length === 0) {
	    if (beforeNode !== undefined || afterNode !== undefined) {
	      var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstElementChild,
	          tmp;
	      if (afterNode === undefined) { afterNode = null; }

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
	    var node$1,
	        mode = afterNode !== undefined ? 1 : 0;

	    for (var i = 0, len = data.length; i < len; i++) {
	      node$1 = createFn(data[i], i);
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
	      prevStartNode = beforeNode ? beforeNode.nextSibling : parent.firstElementChild,
	      newStartNode = prevStartNode,
	      prevEndNode = afterNode ? afterNode.previousSibling : parent.lastElementChild,
	      newEndNode = prevEndNode;

	  fixes: while (loop) {
	    loop = false;

	    var _node = (void 0); // Skip prefix


	    a = renderedValues[prevStart], b = data[newStart];

	    while (a === b) {
	      noOp(prevStartNode, b);
	      prevStart++;
	      newStart++;
	      newStartNode = prevStartNode = prevStartNode.nextSibling;
	      if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
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
	      if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
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
	      if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
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
	        node$2 = createFn(data[newStart], newStart);
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
	      var node$3 = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstElementChild,
	          tmp$1;
	      if (afterNode === undefined) { afterNode = null; }

	      while (node$3 !== afterNode) {
	        tmp$1 = node$3.nextSibling;
	        parent.removeChild(node$3);
	        node$3 = tmp$1;
	        prevStart++;
	      }
	    } else {
	      parent.textContent = '';
	    }

	    var node$4,
	        mode$2 = afterNode ? 1 : 0;

	    for (var i$4 = newStart; i$4 <= newEnd; i$4++) {
	      node$4 = createFn(data[i$4], i$4);
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
	      noOp(afterNode, data[i$7]);
	      lisIdx--;
	    } else {
	      if (P[i$7] === -1) {
	        tmpD = createFn(data[i$7], i$7);
	      } else {
	        tmpD = nodes[P[i$7]];
	        noOp(tmpD, data[i$7]);
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

	// Original: https://github.com/Freak613/stage0/blob/master/reuseNodes.js
	var reuseNodes = function (parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
	  if (data.length === 0) {
	    if (beforeNode !== undefined || afterNode !== undefined) {
	      var node = beforeNode !== undefined ? beforeNode.nextSibling : parent.firstChild,
	          tmp;
	      if (afterNode === undefined) { afterNode = null; }

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
	      head = createFn(item, i$1);
	      mode ? parent.insertBefore(head, afterNode) : parent.appendChild(head);
	    }

	    head = head.nextSibling;
	    if (head === afterNode) { head = null; }
	  }
	};

	// https://github.com/ismail-codar/fidan/blob/master/packages/babel-plugin-fidan-jsx/test/fixtures/call-instance-1/expected.js
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
	var html = function (literals) {
	  var vars = [], len$1 = arguments.length - 1;
	  while ( len$1-- > 0 ) vars[ len$1 ] = arguments[ len$1 + 1 ];

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

	var walkForCommentNodes = function (element, commentNodes) {
	  var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, {
	    acceptNode: function (node) {
	      var nodeValue = node.nodeValue.trim();
	      return nodeValue.startsWith('$cmt') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
	    }
	  }, false);

	  while (treeWalker.nextNode()) {
	    commentNodes.push(treeWalker.currentNode);
	  }
	};

	var updateNodesByCommentNodes = function (commentNodes, params) {
	  var loop = function ( i ) {
	    var commentNode = commentNodes[i];
	    var commentValue = commentNode.nodeValue;
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
	            for (var p = 0; p < param.length; p++) {
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

	  for (var i = 0; i < commentNodes.length; i++) loop( i );
	};

	var arrayMap = function (arr, parentDom, nextElement, renderCallback, renderMode) {
	  if ( renderMode === void 0 ) renderMode = 'reconcile';

	  var prevElement = nextElement ? document.createTextNode('') : undefined;
	  nextElement && parentDom.insertBefore(prevElement, nextElement);
	  computed(function (nextVal, ref) {
	    var caller = ref.caller;

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

	exports.value = value;
	exports.computed = computed;
	exports.injectToProperty = injectToProperty;
	exports.inject = inject;
	exports.debounce = debounce;
	exports.htmlProps = htmlProps;
	exports.html = html;
	exports.arrayMap = arrayMap;

	return exports;

}({}));
