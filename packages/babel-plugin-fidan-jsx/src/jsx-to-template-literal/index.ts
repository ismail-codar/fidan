// https://github.com/johanholmerin/babel-plugin-jsx-to-template-literal

const { declare } = require('@babel/helper-plugin-utils');
const jsx = require('@babel/plugin-syntax-jsx').default;
const generator = require('@babel/generator').default;
const { types: t } = require('@babel/core');

function trimString(string) {
	return string.replace(/\s+/g, (match, offset, string) => {
		// Start
		if (offset === 0) {
			return match.match(/^ *\n/) ? '' : match;
		}

		// End
		if (match.length + offset === string.length) {
			return match.match(/\n *$/) ? '' : match;
		}

		// Middle
		return match.match(/\n/) ? ' ' : match;
	});
}

// Add or append string
function addString(strings, keys, string) {
	const trimmedString = trimString(string);

	if (strings.length <= keys.length) {
		strings.push(t.templateElement({ raw: trimmedString }));
	} else {
		const last = strings[strings.length - 1];
		last.value.raw = last.value.raw + trimmedString;
	}
}

function addKey(strings, keys, key) {
	// Add empty string in case of adjacent keys
	if (strings.length <= keys.length) {
		strings.push(t.templateElement({ raw: '' }));
	}

	keys.push(key);
}

function getTag(node) {
	const name = generator(node.name).code;
	const isCapitalized = name.charAt(0) === name.charAt(0).toUpperCase();
	const isComponent = isCapitalized || node.name.type !== 'JSXIdentifier';

	return { name, isComponent };
}

function createComponent(name, node) {
	const attributes = t.objectExpression(
		node.openingElement.attributes.map((attr) => {
			if (attr.type === 'JSXSpreadAttribute') {
				return t.SpreadElement(attr.argument);
			}

			const value = attr.value ? attr.value.expression || attr.value : t.booleanLiteral(true);

			return t.ObjectProperty(t.stringLiteral(attr.name.name), value);
		})
	);

	const children = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), node.children);

	return t.callExpression(t.identifier(name), [ attributes, children ]);
}

function transformListenerName(name, { lowercaseEventNames, eventNamesPrefix }) {
	const isListener = /^on[A-Z]/.test(name);
	if (!isListener) return name;

	if (lowercaseEventNames) {
		name = name.toLowerCase();
	}

	if (eventNamesPrefix) {
		name = eventNamesPrefix + name.slice(2);
	}

	return name;
}

const transforms = {
	JSXElement({ node, strings, keys }, opts) {
		const { name, isComponent } = getTag(node.openingElement);

		if (isComponent) {
			addKey(strings, keys, createComponent(name, node));
			return;
		}

		// Open opening tag
		addString(strings, keys, `<${name}`);

		// Attributes
		node.openingElement.attributes.forEach((attr) => {
			if (attr.type === 'JSXSpreadAttribute') {
				throw new Error('JSXSpreadAttribute is not supported');
			}

			addString(strings, keys, ` ${transformListenerName(attr.name.name, opts)}`);

			if (attr.value) {
				addString(strings, keys, '="');

				if (attr.value.type === 'JSXExpressionContainer') {
					addKey(strings, keys, attr.value.expression);
				} else {
					addString(strings, keys, attr.value.value);
				}

				addString(strings, keys, '"');
			}
		});

		// Close opening tag
		if (node.openingElement.selfClosing) {
			addString(strings, keys, ' /');
		}
		addString(strings, keys, '>');

		// Children
		node.children.forEach((child) => transforms[child.type]({ node: child, strings, keys }, opts));

		// Closing tag
		if (!node.closingElement) return;
		addString(strings, keys, `</${node.closingElement.name.name}>`);
	},
	JSXSpreadChild() {
		throw new Error('JSXSpreadChild is not supported');
	},
	JSXText({ node, strings, keys }) {
		addString(strings, keys, node.value);
	},
	JSXExpressionContainer({ node, strings, keys }) {
		// Comment
		if (node.expression.type === 'JSXEmptyExpression') return;

		addKey(strings, keys, node.expression);
	},
	JSXFragment({ node, strings, keys }, opts) {
		node.children.forEach((child) => transforms[child.type]({ node: child, strings, keys }, opts));
	}
};

function transformNode(node, opts) {
	const strings = [];
	const keys = [];
	transforms[node.type]({ node, strings, keys }, opts);

	// strings must be one longer than keys
	while (strings.length <= keys.length) {
		addString(strings, keys, '');
	}

	return [ strings, keys ];
}

function replaceNode(path, state) {
	const literal = t.templateLiteral(...transformNode(path.node, state.opts));
	const { tag } = state.opts;

	path.replaceWith(tag ? t.taggedTemplateExpression(t.identifier(tag), literal) : literal);
}

module.exports = declare((api, options) => {
	api.assertVersion(7);

	return {
		inherits: jsx,
		visitor: {
			JSXElement: replaceNode,
			JSXFragment: replaceNode
		}
	};
});
