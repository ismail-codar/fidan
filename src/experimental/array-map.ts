import { insertToDom } from '../dom';
import { compute, FidanValue } from '../f';
import { EventedArray } from '../evented-array';

export const arrayMapWithClone = (
	arr: FidanValue<any[]>,
	parentDom,
	renderTemplate: (i: number) => Element,
	updateList
) => {
	const oArr = arr.$val instanceof EventedArray ? arr.$val : new EventedArray(arr.$val);
	let firstItemDom = null;

	const updateClonedNode = (itemNode, data, i) => {
		updateList.forEach((item) => {
			const path = Object.assign([], item.path);
			while (path.length) {
				itemNode = itemNode.childNodes[path.shift()];
			}
			item.update(itemNode, data, i);
		});
	};
	const createNewItemNode = (i: number) => {
		if (firstItemDom == null) {
			firstItemDom = renderTemplate(i);
			return firstItemDom;
		} else {
			return firstItemDom.cloneNode(true);
		}
	};

	oArr.on('itemadded', function(e) {
		let newItem = createNewItemNode(0);
		updateClonedNode(newItem, e.item, e.index);
		insertToDom(parentDom, e.index, newItem);
	});

	oArr.on('itemset', function(e) {
		let newItem = createNewItemNode(e.index);
		updateClonedNode(newItem, e.item, e.index);
		parentDom.replaceChild(newItem, parentDom.childNodes.item(e.index));
	});

	oArr.on('itemremoved', function(e) {
		parentDom.removeChild(parentDom.childNodes.item(e.index));
	});
	arr(oArr);

	const renderAll = () => {
		if (arr.$val.length === 0) parentDom.textContent = '';
		else {
			firstItemDom = renderTemplate(0);

			updateClonedNode(firstItemDom, arr.$val[0], 0);
			insertToDom(parentDom, 0, firstItemDom);

			for (var i = 1; i < arr.$val.length; i++) {
				const cloned = firstItemDom.cloneNode(true);
				updateClonedNode(cloned, arr.$val[i], i);
				insertToDom(parentDom, i, cloned);
			}
		}
	};
	compute(renderAll, arr);
};
