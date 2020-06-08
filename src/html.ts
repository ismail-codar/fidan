// https://github.com/ismail-codar/fidan/blob/master/packages/babel-plugin-fidan-jsx/test/fixtures/call-instance-1/expected.js
// https://github.com/ismail-codar/fidan/blob/master/src/html.ts

import { computed } from './f';
import { htmlProps } from './dom';

const COMMENT_TEXT = 1;
const COMMENT_DOM = 2;
const COMMENT_FN = 4; // "function" && !isDynamic
const COMMENT_HTM = 8;
const COMMENT_TEXT_OR_DOM = COMMENT_TEXT | COMMENT_DOM;

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
				result += str.substr(0, p) + comment + str.substr(p, str.length - p - attr.length - 3).trim();
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

	console.log(result, vars);

	let template = document.createElement('template');
	template = template.cloneNode(false) as HTMLTemplateElement;
	template.innerHTML = result;

	const element = template.content;
	const commentNodes = [];
	walkForCommentNodes(element, commentNodes);
	console.log(commentNodes);
	updateNodesByCommentNodes(commentNodes, vars);
	return element;
};

const walkForCommentNodes = (element, commentNodes) => {
	var treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_COMMENT,
		{
			acceptNode: function(node) {
				var nodeValue = node.nodeValue.trim();
				return nodeValue.startsWith('$cmt') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
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
		let param = params[i];
		const isDynamic = param && param.hasOwnProperty('$val');

		const attrIdx = commentValue.indexOf('_');
		const commentType =
			attrIdx !== -1
				? COMMENT_DOM
				: typeof param === 'function' && !isDynamic
					? COMMENT_FN
					: typeof param === 'object' && param ? COMMENT_HTM : COMMENT_TEXT;

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
				attributeName = commentValue.substr(attrIdx + 1);
				element = commentNode.nextElementSibling;
			} else {
				debugger;
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
