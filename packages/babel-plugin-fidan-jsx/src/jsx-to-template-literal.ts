// https://github.com/johanholmerin/babel-plugin-jsx-to-template-literal
import * as t from '@babel/types';
import generator from '@babel/generator';
import { declare } from '@babel/helper-plugin-utils';
import check from './check';

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
    strings.push(
      t.templateElement({ raw: trimmedString, cooked: trimmedString })
    );
  } else {
    const last = strings[strings.length - 1];
    last.value.raw = last.value.raw + trimmedString;
    last.value.cooked = last.value.raw;
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
    node.openingElement.attributes.map(attr => {
      if (attr.type === 'JSXSpreadAttribute') {
        return t.spreadElement(attr.argument);
      }

      const value = attr.value
        ? attr.value.expression || attr.value
        : t.booleanLiteral(true);

      return t.objectProperty(t.stringLiteral(attr.name.name), value);
    })
  );

  const children = t.jsxFragment(
    t.jsxOpeningFragment(),
    t.jsxClosingFragment(),
    node.children
  );

  return t.callExpression(t.identifier(name), [attributes, children]);
}

function transformListenerName(
  name,
  { lowercaseEventNames, eventNamesPrefix }
) {
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
    node.openingElement.attributes.forEach(attr => {
      if (attr.name) {
        if (attr.name.name === 'className') {
          attr.name.name = 'class';
        } else if (attr.name.name === 'onDoubleClick') {
          attr.name.name = 'ondblclick';
        }
      }
      if (attr.type === 'JSXSpreadAttribute') {
        debugger;
        throw new Error('JSXSpreadAttribute is not supported');
      }

      addString(
        strings,
        keys,
        ` ${transformListenerName(attr.name.name, opts)}`
      );

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
    node.children.forEach(child =>
      transforms[child.type]({ node: child, strings, keys }, opts)
    );

    // Closing tag
    if (!node.closingElement) return;
    addString(strings, keys, `</${node.closingElement.name.name}>`);
  },
  JSXSpreadChild() {
    debugger;
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
    node.children.forEach(child =>
      transforms[child.type]({ node: child, strings, keys }, opts)
    );
  },
};

function transformNode(node, opts) {
  const quasis = [];
  const expressions = [];
  transforms[node.type]({ node, strings: quasis, keys: expressions }, opts);

  // strings must be one longer than keys
  while (quasis.length <= expressions.length) {
    addString(quasis, expressions, '');
  }

  return { quasis, expressions };
}

function replaceNode(path, state) {
  const transformed = transformNode(path.node, state.opts);
  const literal = t.templateLiteral(
    transformed.quasis,
    transformed.expressions
  );
  if (check.isEmptyLiteral(literal)) {
    path.remove();
  } else {
    path.replaceWith(
      t.taggedTemplateExpression(
        t.memberExpression(t.identifier('fidan'), t.identifier('html')),
        literal
      )
    );
  }
}

export default declare(api => {
  api.assertVersion(7);

  return {
    visitor: {
      JSXElement: replaceNode,
      JSXFragment: replaceNode,
    },
  };
});
