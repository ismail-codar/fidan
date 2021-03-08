import { arrayMap } from './array';

const TEXT = 1;
const DOM = 2;
const FN = 4; // "function" && !isDynamic
const HTM = 8;
const ARRAY = 16;
const TEXT_OR_DOM = TEXT | DOM;

export const htmlProps = {
  id: true,
  nodeValue: true,
  className: true,
  innerHTML: true,
  innerText: true,
  tabIndex: true,
  value: true,
  checked: true,
  disabled: true,
  readonly: true,
  contentEditable: true,
};

let template = document.createElement('template');

export const html = (literals, ...vars): DocumentFragment => {
  let raw = literals.raw,
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
        result =
          result.substr(0, p) +
          comment +
          result.substr(p) +
          str.substr(0, str.length - attr.length - 3).trim();
      } else {
        // fist attribute
        result +=
          str.substr(0, p) +
          comment +
          str.substr(p, str.length - p - attr.length - 3).trim();
      }
    } else {
      //text nodes
      result += str + '<!--$cmt' + '-->';
    }
    i++;
  }
  let extra = raw[raw.length - 1];
  if (extra.startsWith('"')) {
    extra = extra.substr(1);
  }
  result += extra;

  template = template.cloneNode(false) as HTMLTemplateElement;
  template.innerHTML = result.trim();

  const element = template.content;
  const commentNodes = [];
  walkForCommentNodes(element, commentNodes);
  updateNodesByCommentNodes(commentNodes, vars);

  return element;
};

const walkForCommentNodes = (element, commentNodes) => {
  var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, {
    acceptNode: function(node) {
      var nodeValue = node.nodeValue.trim();
      return nodeValue.startsWith('$cmt')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  while (treeWalker.nextNode()) {
    commentNodes.push(treeWalker.currentNode);
  }
};

const updateNodesByCommentNodes = (commentNodes: Comment[], params: any[]) => {
  for (var i = 0; i < commentNodes.length; i++) {
    const commentNode = commentNodes[i];
    var commentValue = commentNode.nodeValue;
    let element = null;
    let attributeName: string = null;
    let param = params[i];
    const isDynamic = param && param.hasOwnProperty('$val');

    const attrIdx = commentValue.indexOf('_');
    const paramType =
      attrIdx !== -1
        ? DOM
        : typeof param === 'function' && !isDynamic
        ? FN
        : Array.isArray(param)
        ? ARRAY
        : typeof param === 'object' && param
        ? HTM
        : TEXT;

    if (paramType & TEXT_OR_DOM) {
      if (paramType === TEXT) {
        if (isDynamic) {
          //COMPUTED
          const value = param.$val;
          let valueElement: Node =
            value == null
              ? null
              : value instanceof Node
              ? value
              : document.createTextNode(value);
          let firstChild: Node = null;
          let lastChild: Node = null;
          if (value != null) {
            firstChild = valueElement.firstChild;
            lastChild = valueElement.lastChild;
            commentNode.parentElement.insertBefore(
              valueElement,
              commentNode.nextSibling
            );
          }
          ((
            parentElement: Node,
            valueElement: Node,
            firstChild: Node,
            lastChild: Node
          ) => {
            param.subscribe(value => {
              let nextLastSibling: Node = null;
              if (firstChild && lastChild) {
                //fragment childs remove
                nextLastSibling = lastChild.nextSibling;
                let element = firstChild;
                while (element && element.parentElement) {
                  const nextSibling = element.nextSibling;
                  element.parentElement.removeChild(element);
                  if (element === lastChild) {
                    break;
                  } else {
                    element = nextSibling;
                  }
                }
              } else if (valueElement) {
                //text remove
                nextLastSibling = valueElement.nextSibling;
                valueElement.parentElement.removeChild(valueElement);
              }
              // add & variables restore
              if (value != null) {
                valueElement =
                  value == null
                    ? null
                    : value instanceof Node
                    ? value
                    : document.createTextNode(value);
                firstChild = valueElement.firstChild;
                lastChild = valueElement.lastChild;
                parentElement.insertBefore(valueElement, nextLastSibling);
              }
            });
          })(commentNode.parentElement, valueElement, firstChild, lastChild);
        } else {
          element = document.createTextNode(param);
          commentNode.parentElement.insertBefore(
            element,
            commentNode.nextSibling
          );
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

      if (attributeName) {
        if (attributeName.startsWith('on')) {
          (element as Element).addEventListener(attributeName.substr(2), param);
        } else if (isDynamic) {
          if (htmlProps[attributeName]) {
            element[attributeName] = param();
            param.subscribe(() => {
              element[attributeName] = param();
            });
          } else {
            element.setAttribute(attributeName, param());
            param.subscribe(() => {
              element.setAttribute(attributeName, param());
            });
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
      }
    } else if (paramType === FN) {
      param(commentNode.parentElement, commentNode.nextElementSibling);
    } else if (paramType === ARRAY) {
      const fragment = document.createDocumentFragment();
      param.forEach(p => {
        fragment.appendChild(p);
      });
      commentNode.parentElement.insertBefore(fragment, commentNode.nextSibling);
    } else if (paramType === HTM) {
      if (param.renderFn) {
        arrayMap(
          param.arr,
          commentNode.parentElement,
          commentNode.nextSibling as any,
          param.renderFn,
          param.renderMode
        );
      } else {
        commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
      }
    }

    commentNode.remove();
  }
};
