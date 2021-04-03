import { arrayMap } from './array';

const TEXT = 1;
const ELEMENT = 2;
const FN = 4; // "function" && !isDynamic
const HTM = 8;
const ARRAY = 16;
const TEXT_OR_ELEMENT = TEXT | ELEMENT;

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

if (!global['createDocument']) {
  global['createDocument'] = () => global['document'];
}

const _document: Document = global['createDocument']();
let template: HTMLTemplateElement = _document.createElement('template');

export const html = (literals, ...vars): (() => DocumentFragment) => {
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

  return function $render() {
    template = template.cloneNode(false) as HTMLTemplateElement;
    template.innerHTML = result.trim();

    const element = template.content;
    const commentNodes = [];
    walkForCommentNodes(element, commentNodes);
    updateNodesByCommentNodes(commentNodes, vars);

    return element;
  };
};

const walkForCommentNodes = (element, commentNodes) => {
  var treeWalker = _document.createTreeWalker(
    element,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function(node) {
        var nodeValue = node.nodeValue.trim();
        return nodeValue.startsWith('$cmt')
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  while (treeWalker.nextNode()) {
    commentNodes.push(treeWalker.currentNode);
  }
};

const updateNodesByCommentNodes = (commentNodes: Comment[], params: any[]) => {
  for (var i = 0; i < commentNodes.length; i++) {
    const commentNode = commentNodes[i];
    let commentNodeParent = commentNode.parentNode;
    var commentValue = commentNode.nodeValue;
    let element = null;
    let attributeName: string = null;

    let param = params[i];

    if (typeof param === 'function' && param.name === '$render') {
      param = param();
    }

    const isDynamic = param && param.hasOwnProperty('$val');

    const attrIdx = commentValue.indexOf('_');
    const paramType =
      attrIdx !== -1
        ? ELEMENT
        : typeof param === 'function' && !isDynamic
        ? FN
        : Array.isArray(param)
        ? ARRAY
        : typeof param === 'object' && param
        ? HTM
        : TEXT;

    if (paramType & TEXT_OR_ELEMENT) {
      if (paramType === TEXT) {
        if (isDynamic) {
          //COMPUTED
          const value = param.$val;
          let valueElement: Node =
            value == null
              ? null
              : value instanceof Node
              ? value
              : _document.createTextNode(value);
          let firstChild: Node = null;
          let lastChild: Node = null;
          if (value != null) {
            firstChild = valueElement.firstChild;
            lastChild = valueElement.lastChild;
            commentNodeParent.insertBefore(
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
                    : _document.createTextNode(value);
                firstChild = valueElement.firstChild;
                lastChild = valueElement.lastChild;
                parentElement.insertBefore(valueElement, nextLastSibling);
              }
            });
          })(commentNodeParent, valueElement, firstChild, lastChild);
        } else {
          element = _document.createTextNode(param);
          commentNodeParent.insertBefore(element, commentNode.nextSibling);
          if (Array.isArray(param)) {
            for (var p = 0; p < param.length; p++) {
              commentNodeParent.appendChild(param[p]);
            }
          }
        }
      } else if (paramType === ELEMENT) {
        attributeName = commentValue.substr(attrIdx + 1);
        element = commentNode.nextElementSibling;
      }

      if (attributeName) {
        if (attributeName.substr(0, 2) === '__') {
          if (attributeName === '__spread') {
            for (var key in param) {
              if (key === 'style') {
                if (param.style.hasOwnProperty('$val')) {
                  setElementStyles(element, param.style());
                  param.style.subscribe(() => {
                    setElementStyles(element, param.style());
                  });
                } else {
                  setElementStyles(element, param.style);
                }
              } else {
                setElementAttribute(
                  element,
                  key,
                  param[key],
                  param[key] && param[key].hasOwnProperty('$val')
                );
              }
            }
          } else if (attributeName === '__style') {
            setElementStyles(element, param);
          }
        } else {
          setElementAttribute(element, attributeName, param, isDynamic);
        }
      }
    } else if (paramType === FN) {
      param(commentNodeParent, commentNode.nextElementSibling);
    } else if (paramType === ARRAY) {
      const fragment = _document.createDocumentFragment();
      param.forEach(p => {
        fragment.appendChild(p);
      });
      commentNodeParent.insertBefore(fragment, commentNode.nextSibling);
    } else if (paramType === HTM) {
      if (param.renderFn) {
        arrayMap(
          param.arr,
          commentNodeParent,
          commentNode.nextSibling as any,
          param.renderFn,
          param.renderMode
        );
      } else {
        commentNodeParent.insertBefore(param, commentNode.nextSibling);
      }
    }

    commentNode.remove();
  }
};

const setElementStyles = (element: HTMLElement, param: any) => {
  for (var key in param) {
    (key => {
      if (param[key]) {
        if (param[key].hasOwnProperty('$val')) {
          element.style[key] = param[key]();
          param[key].subscribe(() => {
            element.style[key] = param[key]();
          });
        }
        element.style[key] = param[key];
      }
    })(key);
  }
};

const setElementAttribute = (
  element: HTMLElement,
  attributeName: string,
  param: any,
  isDynamic
) => {
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
};
