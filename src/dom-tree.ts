import { injectContexts } from './context';

var jsxEventProperty = /^on[A-Z]/;
const svgNS = 'http://www.w3.org/2000/svg';
export const Fragment = Symbol('fjsx.Fragment');

export const setElementAttributes = (element: Element, attributes, forceSetAttr?: boolean) => {
	let attribute = null;
	for (var attributeName in attributes) {
		attribute = attributes[attributeName];
		if (attribute != undefined) {
			if (attribute instanceof Function) {
				if (jsxEventProperty.test(attributeName)) {
					attributeName = attributeName.toLowerCase();
					element[attributeName] = attribute;
				} else attribute(element);
			} else if (attribute instanceof Object) {
				if (Array.isArray(attribute)) {
					addChildElements(element, attribute);
				} else {
					for (var key in attribute) {
						if (typeof attribute[key] === 'function') attribute[key](element);
						else element[attributeName][key] = attribute[key]; // style like
					}
				}
			} else {
				if (forceSetAttr || attributeName.indexOf('-') !== -1) element.setAttribute(attributeName, attribute);
				else element[attributeName] = attribute;
			}
		}
	}
};

export const createElement = (
	tagName: string | Function | Symbol,
	attributes: { [key: string]: any },
	...childs: any[]
) => {
	let element = null;
	if (tagName instanceof Function) {
		if (attributes === null) attributes = {};
		if (childs && childs.length) attributes['children'] = childs;
		injectContexts(attributes);
		element = (tagName as any)(attributes);
		if (element) element['$props'] = attributes;
	} else {
		if (tagName === Fragment) {
			element = document.createDocumentFragment();
		} else {
			element = document.createElement(tagName as any);
			attributes && setElementAttributes(element, attributes, (tagName as string).indexOf('-') !== -1);
		}
		element['$props'] = attributes;
		childs && childs.length && addChildElements(element, childs);
	}
	return element;
};

export const createSvgElement = (tagName: string, attributes: { [key: string]: any }, ...childs: any[]) => {
	let element = document.createElementNS(svgNS, tagName);
	if (attributes) {
		if (attributes.className) {
			// TODO compile time
			attributes.class = attributes.className;
			delete attributes.className;
		}
		setElementAttributes(element, attributes, true);
	}
	element['$props'] = attributes;
	childs && childs.length && addChildElements(element, childs);
	return element;
};

export const addChildElements = (element, childs) => {
	let props = null;
	for (var i = 0; i < childs.length; i++) {
		if (Array.isArray(childs[i])) addChildElements(element, childs[i]);
		else if (childs[i] instanceof Function) childs[i](element);
		else {
			if (childs[i]) {
				props = childs[i]['$props'];
				element.appendChild(childs[i] instanceof Node ? childs[i] : document.createTextNode(childs[i]));
				props && props.didMount && props.didMount(element, childs[i]);
			}
		}
	}
};

export const createTextNode = (parent) => {
	return parent.appendChild(document.createTextNode(''));
};

export const cloneElement = (element: Element, attributes: any) => {
	element = element.cloneNode(true) as Element;
	attributes && setElementAttributes(element, attributes, false);
	return element;
};
