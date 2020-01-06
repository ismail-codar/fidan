import { computed } from './f';
import { arrayMap, htmlProps } from './dom';
import { FidanValue } from '.';

const COMMENT_TEXT = 1;
const COMMENT_DOM = 2;
const COMMENT_FN = 4; // "function" && !isDynamic
const COMMENT_HTM = 8;
const COMMENT_TEXT_OR_DOM = COMMENT_TEXT | COMMENT_DOM;

let _templateMode = false; // TODO kaldırılacak yerine başka bir yöntem geliştirilecek
let template = document.createElement('template');

export const coditionalDom = (
	condition: () => boolean,
	dependencies: FidanValue<any>[],
	htmlFragment: DocumentFragment
) => (parentElement: Element, nextElement: Element) => {
	const childs = Array.from(htmlFragment.children);
	let inserted = false;
	computed(() => {
		if (condition()) {
			if (!inserted) {
				let tmpNextElement = nextElement;
				for (var i = childs.length - 1; i >= 0; i--) {
					const child = childs[i];
					tmpNextElement = parentElement.insertBefore(child, tmpNextElement);
				}
				inserted = true;
			}
		} else {
			childs.forEach((child) => child.remove());
			inserted = false;
		}
	}, dependencies);
};

const putCommentToTagStart = (htm: string[], index: number, comment: string) => {
	for (var i = index; i >= 0; i--) {
		let item = htm[i];
		let p = item.lastIndexOf('<');
		if (p !== -1) {
			htm[i] = item.substr(0, p) + comment + item.substr(p);
			// htm[i] =
			//   item.substr(0, p) + comment + item.substr(p, item.lastIndexOf(" ") - p);
			// if (htm[index + 1].substr(0, 1) === '"') {
			//   htm[index + 1] = htm[index + 1].substr(1);
			// }
			break;
		}
	}
};

export const html = (...args) => {
	const htm: string[] = args[0].slice();
	const params = args.slice(1);
	let attributeName: string = null;
	let i = 0;

	for (var index = 0; index < htm.length; index++) {
		let item = htm[index];
		const param = params[index];
		if (param === undefined) {
			break;
		}
		const isDynamic = param && param.hasOwnProperty('$val');
		if (isDynamic) {
			if (param['$indexes'] === undefined) {
				param['$indexes'] = [];
			}
			param['$indexes'].push(index);
		}
		if (item.endsWith('="')) {
			i = item.lastIndexOf(' ') + 1;
			attributeName = item.substr(i, item.length - i - 2);
			putCommentToTagStart(htm, index, `<!-- cmt_${COMMENT_DOM}_${index}_${attributeName} -->`);
		} else {
			let commentType =
				typeof param === 'function' && !isDynamic
					? COMMENT_FN
					: typeof param === 'object' && param ? COMMENT_HTM : COMMENT_TEXT;
			htm[index] = item + `<!-- cmt_${commentType}_${index} -->`;
		}
	}
	template = template.cloneNode(false) as HTMLTemplateElement;
	template.innerHTML = htm.join('');
	/**    
    .replace(/\n/g, "")
    .replace(/  /g, " ")
    .replace(/  /g, "")
    .replace(/> /g, ">")
    .replace(/ </g, "<");
     */
	const element = template.content;
	element['$params'] = params;
	if (!_templateMode) {
		var commentNodes = [];
		walkForCommentNodes(element, commentNodes);
		updateNodesByCommentNodes(commentNodes, params);
	}
	return element;
};

const walkForCommentNodes = (element, commentNodes) => {
	var treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_COMMENT,
		{
			acceptNode: function(node) {
				var nodeValue = node.nodeValue.trim();
				return nodeValue.startsWith('cmt_') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			}
		},
		false
	);

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

		let i1 = commentValue.indexOf('_') + 1;
		var i2 = commentValue.indexOf('_', i1);
		const commentType = parseInt(commentValue.substr(i1, i2 - i1));
		i1 = commentValue.indexOf('_', i2) + 1;
		i2 = commentValue.indexOf('_', i1);
		if (i2 === -1) {
			i2 = commentValue.indexOf(' ', i1);
		}
		let paramIndex = parseInt(commentValue.substr(i1, i2 - i1));
		let param = params[paramIndex];
		const isDynamic = param && param.hasOwnProperty('$val');

		if (commentType & COMMENT_TEXT_OR_DOM) {
			if (commentType === COMMENT_TEXT) {
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
			} else if (commentType === COMMENT_DOM) {
				attributeName = commentValue.substr(i2 + 1, commentValue.length - i2 - 2);
				element = commentNode.nextElementSibling;
			}
			// commentType !== COMMENT_FN && commentNode.remove();
			if (attributeName.startsWith('on')) {
				(element as Element).addEventListener(attributeName.substr(2), param);
			} else if (isDynamic) {
				if (htmlProps[attributeName]) {
					computed(
						(val) => {
							element[attributeName] = val;
						},
						[ param ]
					);
					element[attributeName] = param();
				} else {
					computed(
						(val) => {
							element.setAttribute(attributeName, val);
						},
						[ param ]
					);
					element.setAttribute(attributeName, param());
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
		} else if (commentType === COMMENT_FN) {
			if (commentNode.parentElement) {
				param(commentNode.parentElement, commentNode.nextElementSibling);
				// commentNode.remove();
			} else {
				//conditionalDom can be place on root
				window.requestAnimationFrame(() => {
					param(commentNode.parentElement, commentNode.nextElementSibling);
					// commentNode.remove();
				});
			}
		} else if (commentType === COMMENT_HTM) {
			commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
		}
	}
};

export const htmlArrayMap = <T>(
	arr: FidanValue<T[]>,
	renderCallback: (data: T) => DocumentFragment,
	options?: {
		useCloneNode: boolean;
		renderMode?: 'reuse' | 'reconcile';
	}
) => {
	options = Object.assign({ useCloneNode: false, reuseMode: false }, options);
	if (options.useCloneNode) {
		return (parentElement: Element, nextElement: Element) => {
			let clonedNode = null;
			let params = null;
			let dataParamIndexes = [];
			// let commentNodesAddresses: number[][] = null;
			const arrayMapFn = (data) => {
				let renderNode = null;
				var commentNodes = [];
				if (clonedNode === null) {
					_templateMode = true;
					renderNode = renderCallback(data);
					_templateMode = false;
					params = renderNode['$params'];
					for (var key in data) {
						const indexes = data[key]['$indexes'];
						if (indexes)
							for (var i = 0; i < indexes.length; i++) {
								dataParamIndexes.push(indexes[i], key);
							}
					}
					clonedNode = renderNode.cloneNode(true);
					// walkForCommentNodes(clonedNode, commentNodes);
					// commentNodesAddresses = generateCommentNodesAddresses(commentNodes);
				} else {
					renderNode = clonedNode.cloneNode(true);
				}
				for (var i = 0; i < dataParamIndexes.length; i += 2) {
					params[dataParamIndexes[i]] = data[dataParamIndexes[i + 1]];
				}
				// generateCommentNodesFromAddresses(
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
		return function(parentElement: Element, nextElement: Element) {
			arrayMap(arr as any, parentElement, nextElement, renderCallback);
		};
	}
};

// const generateCommentNodesAddresses = (commentNodes: Comment[]) => {
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
