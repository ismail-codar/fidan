// https://github.com/ismail-codar/fidan/blob/master/packages/babel-plugin-fidan-jsx/test/fixtures/call-instance-1/expected.js
// https://github.com/ismail-codar/fidan/blob/master/src/html.ts

import { computed } from './f';
import { htmlProps, arrayMap } from './dom';

const TEXT = 1;
const DOM = 2;
const FN = 4; // "function" && !isDynamic
const HTM = 8;
const ARRAY = 16;
const TEXT_OR_DOM = TEXT | DOM;

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

	template = template.cloneNode(false) as HTMLTemplateElement;
	template.innerHTML = result;

	const element = template.content;
	const commentNodes = [];
	walkForCommentNodes(element, commentNodes);
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
		const paramType =
			attrIdx !== -1
				? DOM
				: typeof param === 'function' && !isDynamic
					? FN
					: Array.isArray(param) ? ARRAY : typeof param === 'object' && param ? HTM : TEXT;

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
				(element as Element).addEventListener(attributeName.substr(2), param);
			} else if (isDynamic) {
				if (htmlProps[attributeName]) {
					computed(
						() => {
							element[attributeName] = param();
						},
						[ param ]
					);
				} else {
					computed(
						() => {
							element.setAttribute(attributeName, param());
						},
						[ param ]
					);
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
				window.requestAnimationFrame(() => {
					param(commentNode.parentElement, commentNode.nextElementSibling);
					commentNode.remove();
				});
			}
		} else if (paramType === ARRAY) {
			const fragment = document.createDocumentFragment();
			param.forEach((p) => {
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
	}
};
