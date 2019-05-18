var autoTrackDependencies = null; // T extends Array<any> ? FidanArray<T> : FidanValue<T> --> https://github.com/Microsoft/TypeScript/issues/30029

var value = function (val) {
  if (val && val.hasOwnProperty("$val")) { return val; }

  var innerFn = function (val) {
    if (val === undefined) {
      if (autoTrackDependencies && autoTrackDependencies.indexOf(innerFn) === -1) {
        autoTrackDependencies.push(innerFn);
      }

      return innerFn["$val"];
    } else {
      var depends = innerFn["bc_depends"];
      if (depends.length) { for (var i = 0; i < depends.length; i++) {
        depends[i].beforeCompute(val, innerFn["$val"], innerFn);
      } }
      innerFn["$val"] = val;

      if (Array.isArray(val)) {
        overrideArrayMutators(innerFn);
      }

      depends = innerFn["c_depends"];
      if (depends.length) { for (var i = 0; i < depends.length; i++) {
        depends[i](depends[i].compute(val));
      } }
    }
  };

  innerFn["$val"] = val;

  if (Array.isArray(val)) {
    overrideArrayMutators(innerFn);
  }

  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];

  innerFn.depends = function (dependencies) {
    var deps = dependencies();

    for (var i = 0; i < deps.length; i++) { innerFn["c_depends"].push(deps[i]); }

    return innerFn;
  };

  innerFn.debugName = function (name) {
    Object.defineProperty(innerFn, "name", {
      value: name
    });
    return innerFn;
  };

  innerFn.toString = innerFn.toJSON = function () { return innerFn["$val"]; };

  return innerFn;
};
var compute = function (fn, dependencies) {
  autoTrackDependencies = dependencies ? null : [];
  var val = fn(undefined);
  var deps = autoTrackDependencies ? autoTrackDependencies : dependencies;
  autoTrackDependencies = null;
  var cmp = value(val);
  cmp["compute"] = fn;

  for (var i = 0; i < deps.length; i++) { deps[i]["c_depends"].push(cmp); }

  return cmp;
};
var beforeCompute = function (initalValue, fn, deps) {
  var cmp = value(fn(initalValue));
  cmp["beforeCompute"] = fn;

  for (var i = 0; i < deps.length; i++) { deps[i]["bc_depends"].push(cmp); }

  return cmp;
};

var overrideArrayMutators = function (dataArray) {
  if (!dataArray.size) { dataArray.size = value(dataArray.$val.length); }else { dataArray.size(dataArray.$val.length); }
  if (dataArray.$val["$overrided"]) { return; }
  dataArray.$val["$overrided"] = true;
  ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"].forEach(function (method) {
    dataArray.$val[method] = function () {
      var arr = dataArray.$val.slice(0);
      var size1 = arr.length;
      var ret = Array.prototype[method].apply(arr, arguments);
      var size2 = arr.length;
      if (size1 !== size2) { dataArray.size(size2); }
      dataArray(arr);
      return ret;
    };
  });
};

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

// Original: https://github.com/Freak613/stage0/blob/master/reconcile.js
function reconcile(parent, renderedValues, data, createFn, noOp, beforeNode, afterNode) {
  // Fast path for clear
  if (data.length === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      var node = beforeNode !== undefined ? beforeNode.nextElementSibling : parent.firstElementChild,
          tmp;
      if (afterNode === undefined) { afterNode = null; }

      while (node && node !== afterNode) {
        tmp = node.nextElementSibling;
        parent.removeChild(node);
        node = tmp;
      }
    } else {
      parent.textContent = "";
    }

    return;
  } // Fast path for create


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
      prevStartNode = beforeNode ? beforeNode.nextElementSibling : parent.firstElementChild,
      newStartNode = prevStartNode,
      prevEndNode = afterNode ? afterNode.previousElementSibling : parent.lastElementChild,
      newEndNode = prevEndNode;

  fixes: while (loop) {
    loop = false;

    var _node = (void 0); // Skip prefix


    a = renderedValues[prevStart], b = data[newStart];

    while (a === b) {
      noOp(prevStartNode, b);
      prevStart++;
      newStart++;
      newStartNode = prevStartNode = prevStartNode.nextElementSibling;
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
      newEndNode = prevEndNode = prevEndNode.previousElementSibling;
      if (prevEnd < prevStart || newEnd < newStart) { break fixes; }
      a = renderedValues[prevEnd];
      b = data[newEnd];
    } // Fast path to swap backward


    a = renderedValues[prevEnd], b = data[newStart];

    while (a === b) {
      loop = true;
      noOp(prevEndNode, b);
      _node = prevEndNode.previousElementSibling;
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
      _node = prevStartNode.nextElementSibling;
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
          next = prevEndNode.previousElementSibling;
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
      var node$3 = beforeNode !== undefined ? beforeNode.nextElementSibling : parent.firstElementChild,
          tmp$1;
      if (afterNode === undefined) { afterNode = null; }

      while (node$3 !== afterNode) {
        tmp$1 = node$3.nextElementSibling;
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
    tmpC = tmpC.nextElementSibling;
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
        tmpD = createFn(data[i$7]);
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
var arrayMap = function (arr, parentDom, nextElement, renderCallback, renderMode) {
  // const prevElement = document.createDocumentFragment();
  var prevElement = nextElement ? document.createTextNode("") : undefined;
  nextElement && parentDom.insertBefore(prevElement, nextElement);
  beforeCompute(arr.$val, function (nextVal, beforeVal) {
    if (!renderMode) {
      var parentFragment = document.createDocumentFragment();
      parentDom.textContent = "";

      for (var i = 0; i < nextVal.length; i++) {
        insertToDom(parentFragment, i, renderCallback(nextVal[i], i));
      }

      parentDom.appendChild(parentFragment);
    } else {
      var renderFunction = renderMode === "reconcile" ? reconcile : reuseNodes;
      renderFunction(parentDom, beforeVal || [], nextVal || [], function (nextItem) {
        // create
        return renderCallback(nextItem);
      }, function (nextItem, prevItem) {// update
        // for (var key in nextItem) {
        //   if (prevItem[key].hasOwnProperty("$val")) {
        //     nextItem[key].depends = prevItem[key].depends;
        //     prevItem[key](nextItem[key]());
        //   }
        // }
      }, prevElement, nextElement);
    }
  }, [arr]);
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
    set: function (v) { return v.hasOwnProperty("$val") ? val = v : val(v); }
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

var COMMENT_TEXT = 1;
var COMMENT_DOM = 2;
var COMMENT_FN = 4; // "function" && !isDynamic

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
  value: true,
  checked: true,
  disabled: true,
  readonly: true,
  contentEditable: true
};
var _templateMode = false; // TODO kaldırılacak yerine başka bir yöntem geliştirilecek

var template = document.createElement("template");
var coditionalDom = function (condition, dependencies, htmlFragment) { return function (parentElement, nextElement) {
  var childs = Array.from(htmlFragment.children);
  var inserted = false;
  compute(function () {
    if (condition()) {
      if (!inserted) {
        var tmpNextElement = nextElement;

        for (var i = childs.length - 1; i >= 0; i--) {
          var child = childs[i];
          tmpNextElement = parentElement.insertBefore(child, tmpNextElement);
        }

        inserted = true;
      }
    } else {
      childs.forEach(function (child) { return child.remove(); });
      inserted = false;
    }
  }, dependencies);
}; };

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

    var isDynamic = param && param.hasOwnProperty("$val");

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
      var commentType = typeof param === "function" && !isDynamic ? COMMENT_FN : typeof param === "object" && param ? COMMENT_HTM : COMMENT_TEXT;
      htm[index] = item + "<!-- cmt_" + commentType + "_" + index + " -->";
    }
  }

  template = template.cloneNode(false);
  template.innerHTML = htm.join("");
  /**
    .replace(/\n/g, "")
    .replace(/  /g, " ")
    .replace(/  /g, "")
    .replace(/> /g, ">")
    .replace(/ </g, "<");
     */

  var element = template.content;
  element["$params"] = params;

  if (!_templateMode) {
    var commentNodes = [];
    walkForCommentNodes(element, commentNodes);
    updateNodesByCommentNodes(commentNodes, params);
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

var updateNodesByCommentNodes = function (commentNodes, params) {
  var loop = function ( i ) {
    var commentNode = commentNodes[i];
    var commentValue = commentNode.nodeValue;
    var element = null;
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
    var isDynamic = param && param.hasOwnProperty("$val");

    if (commentType & COMMENT_TEXT_OR_DOM) {
      if (commentType === COMMENT_TEXT) {
        attributeName = "textContent";
        element = document.createTextNode(isDynamic ? param.$val : param);
        commentNode.parentElement.insertBefore(element, commentNode.nextSibling);

        if (!isDynamic) {
          if (Array.isArray(param)) {
            for (var p = 0; p < param.length; p++) {
              commentNode.parentElement.appendChild(param[p]);
            }
          }
        }
      } else if (commentType === COMMENT_DOM) {
        attributeName = commentValue.substr(i2 + 1, commentValue.length - i2 - 2);
        element = commentNode.nextElementSibling;
      } // commentType !== COMMENT_FN && commentNode.remove();


      if (attributeName.startsWith("on")) {
        element.addEventListener(attributeName.substr(2), param);
      } else if (isDynamic) {
        if (htmlProps[attributeName]) {
          compute(function (val) {
            element[attributeName] = val;
          }, [param]);
          element[attributeName] = param();
        } else {
          compute(function (val) {
            element.setAttribute(attributeName, val);
          }, [param]);
          element.setAttribute(attributeName, param());
        }
      } else {
        if (htmlProps[attributeName]) {
          element[attributeName] = param;
        } else if (typeof param === "function") {
          param(element);
        } else {
          element.setAttribute(attributeName, param);
        }
      }
    } else if (commentType === COMMENT_FN) {
      if (commentNode.parentElement) {
        param(commentNode.parentElement, commentNode.nextElementSibling); // commentNode.remove();
      } else {
        //conditionalDom can be place on root
        window.requestAnimationFrame(function () {
          param(commentNode.parentElement, commentNode.nextElementSibling); // commentNode.remove();
        });
      }
    } else if (commentType === COMMENT_HTM) {
      commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
    }
  };

  for (var i = 0; i < commentNodes.length; i++) loop( i );
};

var htmlArrayMap = function (arr, renderCallback, options) {
  options = Object.assign({
    useCloneNode: false,
    reuseMode: false
  }, options);

  if (options.useCloneNode) {
    return function (parentElement, nextElement) {
      var clonedNode = null;
      var params = null;
      var dataParamIndexes = []; // let commentNodesAddresses: number[][] = null;

      var arrayMapFn = function (data) {
        var renderNode = null;
        var commentNodes = [];

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

          clonedNode = renderNode.cloneNode(true); // walkForCommentNodes(clonedNode, commentNodes);
          // commentNodesAddresses = generateCommentNodesAddresses(commentNodes);
        } else {
          renderNode = clonedNode.cloneNode(true);
        }

        for (var i = 0; i < dataParamIndexes.length; i += 2) {
          params[dataParamIndexes[i]] = data[dataParamIndexes[i + 1]];
        } // generateCommentNodesFromAddresses(
        //   commentNodesAddresses,
        //   renderNode,
        //   commentNodes
        // );


        walkForCommentNodes(renderNode, commentNodes);
        updateNodesByCommentNodes(commentNodes, params);
        return renderNode;
      };

      arrayMap(arr, parentElement, nextElement, arrayMapFn, options.renderMode);
    };
  } else {
    return function (parentElement, nextElement) {
      arrayMap(arr, parentElement, nextElement, renderCallback);
    };
  }
}; // const generateCommentNodesAddresses = (commentNodes: Comment[]) => {
//   const paths: number[][] = [];
//   for (var i = 0; i < commentNodes.length; i++) {
//     const path: number[] = [];
//     let node = commentNodes[i] as Node & ChildNode;
//     let parent = node.parentNode as Node & ParentNode;
//     while (parent) {
//       path.push(Array.from(parent.childNodes).indexOf(node));
//       node = parent as any;
//       parent = parent.parentNode;
//     }
//     paths.push(path.reverse());
//   }
//   return paths;
// };
// const generateCommentNodesFromAddresses = (
//   commentNodesAddresses: number[][],
//   element: Element,
//   commentNodes: Comment[]
// ) => {
//   for (var i = 0; i < commentNodesAddresses.length; i++) {
//     const path = commentNodesAddresses[i];
//     let node = null;
//     let parent = element;
//     for (var p = 0; p < path.length; p++) {
//       node = parent.childNodes.item(path[p]);
//       parent = node;
//     }
//     commentNodes.push(node);
//   }
// };

exports.value = value;
exports.compute = compute;
exports.beforeCompute = beforeCompute;
exports.insertToDom = insertToDom;
exports.arrayMap = arrayMap;
exports.injectToProperty = injectToProperty;
exports.inject = inject;
exports.debounce = debounce;
exports.coditionalDom = coditionalDom;
exports.html = html;
exports.htmlArrayMap = htmlArrayMap;
//# sourceMappingURL=index.js.map
