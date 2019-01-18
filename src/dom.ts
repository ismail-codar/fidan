import { FidanValue } from './f';
import { EventedArray } from './evented-array';
import { compute } from './f';
import { activateContext, deactivateContext } from '../src/context';

export const conditionalElement = (parentElement, oldElement, newElementFn: () => any) => {
	parentElement['$props'] && activateContext(parentElement['$props']['$context']);
	let newElement = newElementFn();
	parentElement['$props'] && deactivateContext(parentElement['$props']['$context']);
	if (newElement instanceof Node === false) newElement = document.createTextNode(newElement || '');
	if (oldElement) parentElement.replaceChild(newElement, oldElement);
	else parentElement.appendChild(newElement);
	return newElement;
};

export const insertToDom = (parentElement, index, itemElement) => {
	if (itemElement instanceof Function) itemElement(parentElement);
	else {
		if (itemElement instanceof Node === false) itemElement = document.createTextNode(itemElement);
		parentElement.insertBefore(itemElement, parentElement.childNodes[index]);
	}
};

export const arrayMap = (
	arr: FidanValue<any[]>,
	parentDom: Node,
	renderReturn: (item: any, idx?: number, isInsert?: boolean) => void
) => {
	const oArr = arr.$val instanceof EventedArray ? arr.$val : new EventedArray(arr.$val);

	let parentRef: { parent: Node; next: Node } = null;
	oArr.on('beforemulti', function() {
		if (parentDom.parentNode) {
			parentRef = { parent: parentDom, next: parentDom.nextSibling };
			parentDom = document.createDocumentFragment();
		}
	});
	oArr.on('aftermulti', function() {
		if (parentRef) {
			parentRef.parent.insertBefore(parentDom, parentRef.next);
			parentDom = parentRef.parent;
		}
	});

	oArr.on('itemadded', function(e) {
		insertToDom(parentDom, e.index, renderReturn(e.item, e.index));
	});

	oArr.on('itemset', function(e) {
		parentDom.replaceChild(renderReturn(e.item, e.index) as any, parentDom.childNodes.item(e.index));
	});

	oArr.on('itemremoved', function(e) {
		parentDom.removeChild(parentDom.childNodes.item(e.index));
	});
	arr(oArr);

	const renderAll = () => {
		if (arr.$val.length === 0) parentDom.textContent = '';
		else {
			const parentFragment = document.createDocumentFragment();
			parentDom.textContent = '';
			for (var i = (parentDom as Element).childElementCount; i < arr.$val.length; i++)
				insertToDom(parentFragment, i, renderReturn(arr.$val[i], i));
			parentDom.appendChild(parentFragment);
		}
	};
	compute(renderAll, arr);
};
