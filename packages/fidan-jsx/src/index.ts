import { computed, FidanValue, htmlProps, arrayMap as fidanArrayMap } from '@fidanjs/runtime';

export * from './events';
export * from './array-map';

export const arrayMap = (
	parent: Node & ParentNode,
	arr: FidanValue<any[]>,
	renderCallback?: (item: any, idx?: number) => any,
	marker?: Element
) => {
	fidanArrayMap(arr, parent, marker, renderCallback, 'reconcile');
};

export const insert = (parent: Node, accessor: any, init?: any, marker?: Node) => {
	if (typeof accessor === 'object') {
		if (Array.isArray(accessor)) {
			accessor.forEach(function(item) {
				parent.insertBefore(item, marker);
			});
		} else if (accessor instanceof Node) {
			parent.insertBefore(accessor, marker);
		} else if (accessor instanceof Promise) {
			accessor
				.then((accessorData) => {
					parent.insertBefore(accessorData, marker);
				})
				.catch((err) => {
					const errElement = document.createElement('span');
					errElement.className = 'fidan-async-error';
					console.error(err);
					errElement.innerHTML = err.toString();
					parent.insertBefore(errElement, marker);
				});
		}
	} else if (typeof accessor === 'function') {
		const accessorVal = accessor();
		let node = accessorVal instanceof Node ? accessorVal : document.createTextNode('');
		if (accessor.hasOwnProperty('$val')) {
			let oldNode = null;
			accessor.depends((val) => {
				if (node instanceof Text) {
					node.data = val;
					!node.parentNode && parent.insertBefore(node, marker);
				} else {
					node = val;
					if (!oldNode) {
						parent.insertBefore(node, marker);
					} else {
						parent.replaceChild(node, oldNode);
					}
					oldNode = node;
				}
			});
		} else {
			if (node instanceof Text) node.data = accessorVal;
			parent.insertBefore(node, marker);
		}
	} else if (accessor !== undefined) {
		const node = document.createTextNode(accessor);
		parent.insertBefore(node, marker);
	}
};

export const spread = (node: HTMLElement, accessor: any) => {
	if (typeof accessor === 'function') {
		accessor(node);
	} else {
		if (typeof accessor === 'object') {
			for (var key in accessor) {
				accessor[key] != null && attr(node, key, !htmlProps[key] || key.indexOf('-') !== -1, accessor[key]);
			}
			return;
		} else if (accessor instanceof Node === false) accessor = document.createTextNode(accessor || '');
		node.appendChild(accessor);
	}
};

export const attr = (node: Element, attributeName: string, setAttr: boolean, cmp: any) => {
	if (cmp.hasOwnProperty('$val')) {
		if (setAttr) {
			computed(() => node.setAttribute(attributeName, cmp()), [ cmp ]);
		} else {
			computed(() => (node[attributeName] = cmp()), [ cmp ]);
		}
	} else {
		if (typeof cmp === 'function') {
			cmp = cmp(node);
		}
		if (setAttr) {
			node.setAttribute(attributeName, cmp);
		} else {
			node[attributeName] = cmp;
		}
	}
};

export const conditional = (
	parent: Node & ParentNode,
	condition: {
		test: () => boolean | FidanValue<any>;
		consequent: any;
		alternate: any;
	},
	init?: any,
	marker?: Node
) => {
	let oldElement = null;
	let lastVal = false;
	const conditionCompute = condition.test.hasOwnProperty('$val') ? condition.test : computed(condition.test);
	computed(
		() => {
			if (oldElement && parent.childElementCount === 0) {
				return;
			}
			const val = conditionCompute();
			if (val !== lastVal) {
				if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
					parent = marker.parentNode;
				}
				let newElement = val ? condition.consequent() : condition.alternate();
				oldElement && oldElement.remove();
				insert(parent, newElement, init, marker);
				oldElement = newElement;
			}
			lastVal = val;
		},
		[ conditionCompute ]
	);
};
