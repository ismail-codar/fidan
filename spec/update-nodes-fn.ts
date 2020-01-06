import { compute } from "../src/f";

const COMMENT_TEXT = 1;
const COMMENT_DOM = 2;
const COMMENT_FN = 4; // "function" && !isDynamic
const COMMENT_HTM = 8;
const COMMENT_TEXT_OR_DOM = COMMENT_TEXT | COMMENT_DOM;

const htmlProps = {
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

const clonedNode = document.createElement("template");
clonedNode.innerHTML = `
<tr>
<td class="col-md-1"><!-- cmt_1_0 --></td>
<td class="col-md-4">
    <a class="lbl"><!-- cmt_1_1 --></a>
</td>
<td class="col-md-1">
  <!-- cmt_2_2_data-id --><a data-id="">
    <!-- cmt_2_3_data-id --><span data-id="" class="remove glyphicon glyphicon-remove" aria-hidden="true"></span>
  </a>
</td>
<td class="col-md-6"></td>
</tr>
`;
const dataParamIndexes = [0, "id", 2, "id", 3, "id", 1, "label"];

// OUTPUT
const data = { id: 1, label: "big green chair" };
const outputHTML = `
<tr>
      <td class="col-md-1"><!-- cmt_1_0 -->1</td>
      <td class="col-md-4">
          <a class="lbl"><!-- cmt_1_1 -->big green chair</a>
      </td>
      <td class="col-md-1">
        <!-- cmt_2_2_data-id --><a data-id="1">
          <!-- cmt_2_3_data-id --><span data-id="1" class="remove glyphicon glyphicon-remove" aria-hidden="true"></span>
        </a>
      </td>
      <td class="col-md-6"></td>
  </tr>
`;

const walkForCommentNodes = (element, commentNodes) => {
  var treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function(node) {
        var nodeValue = node.nodeValue.trim();
        return nodeValue.startsWith("cmt_")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    },
    false
  );

  while (treeWalker.nextNode()) {
    commentNodes.push(treeWalker.currentNode);
  }
};

const updateNodesByCommentNodes = (element: Node, params: any[]) => {
  var commentNodes = [];
  walkForCommentNodes(element, commentNodes);

  for (var i = 0; i < commentNodes.length; i++) {
    const commentNode = commentNodes[i];
    var commentValue = commentNode.nodeValue;
    let element = null;
    let attributeName: string = null;

    let i1 = commentValue.indexOf("_") + 1;
    var i2 = commentValue.indexOf("_", i1);
    const commentType = parseInt(commentValue.substr(i1, i2 - i1));
    i1 = commentValue.indexOf("_", i2) + 1;
    i2 = commentValue.indexOf("_", i1);
    if (i2 === -1) {
      i2 = commentValue.indexOf(" ", i1);
    }
    let paramIndex = parseInt(commentValue.substr(i1, i2 - i1));
    let param = params[paramIndex];

    if (commentType & COMMENT_TEXT_OR_DOM) {
      if (commentType === COMMENT_TEXT) {
        attributeName = "textContent";
        element = document.createTextNode(param.$val);
        commentNode.parentElement.insertBefore(
          element,
          commentNode.nextSibling
        );
        if (!param.hasOwnProperty("$val")) {
          if (Array.isArray(param)) {
            for (var p = 0; p < param.length; p++) {
              commentNode.parentElement.appendChild(param[p]);
            }
          }
        }
      } else if (commentType === COMMENT_DOM) {
        attributeName = commentValue.substr(
          i2 + 1,
          commentValue.length - i2 - 2
        );
        element = commentNode.nextElementSibling;
      }
      // commentType !== COMMENT_FN && commentNode.remove();
      if (attributeName.startsWith("on")) {
        (element as Element).addEventListener(attributeName.substr(2), param);
      } else if (param.hasOwnProperty("$val")) {
        if (htmlProps[attributeName]) {
          computed(
            val => {
              element[attributeName] = val;
            },
            () => [param]
          ).debugName("[" + attributeName + "]");
          element[attributeName] = param();
        } else {
          computed(
            val => {
              element.setAttribute(attributeName, val);
            },
            () => [param]
          ).debugName("attr(" + attributeName + ")");
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
        param(commentNode.parentElement, commentNode.nextElement);
        // commentNode.remove();
      } else {
        //conditionalDom can be place on root
        window.requestAnimationFrame(() => {
          param(commentNode.parentElement, commentNode.nextElement);
          // commentNode.remove();
        });
      }
    } else if (commentType === COMMENT_HTM) {
      commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
    }
  }
};

const generateUpdateNodesFn = (clonedNode, dataParamIndexes) => {
  // TODO GENERATE REACTIVE FUNCTIONS
  const reacts = [
    (node, params) => {
      return (node.firstElementChild.children[0].textContent = params[0]());
    },
    (node, params) => {
      return (node.firstElementChild.children[1].textContent = params[1]());
    }
  ];

  return data => {
    const node = clonedNode.cloneNode(true);
    var params = [];
    for (var d = 0; d < dataParamIndexes.length; d += 2) {
      params[dataParamIndexes[d]] = data[dataParamIndexes[d + 1]];
    }

    for (var r = 0; r < reacts.length; r++) {
      reacts[r](node, params);
    }

    return node;
  };
};
