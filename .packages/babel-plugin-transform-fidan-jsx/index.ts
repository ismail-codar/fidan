import * as t from '@babel/types';
import { NodePath } from 'babel-traverse';
import babelPluginJsx from '@babel/plugin-syntax-jsx';

export = function(babel) {
	return {
		inherits: babelPluginJsx,
		name: 'transform-fidan-jsx',
		visitor: {
			JSXElement(path: NodePath<t.JSXElement>) {
				const refAttr = [];
				const restAttr = [];
				let refObject = null;
				for (var i = 0; i < path.node.openingElement.attributes.length; i++) {
					const attr = path.node.openingElement.attributes[i];
					if (t.isJSXSpreadAttribute(attr)) {
						restAttr.push(attr);
					} else if (attr.name.name === 'ref') {
						refAttr.push(attr);
					} else {
						restAttr.push(attr);
					}
				}

				if (refAttr.length) {
					const attrValue = refAttr[refAttr.length - 1].value;
					let refMember: t.Identifier = null;
					if (t.isJSXExpressionContainer(attrValue)) {
						if (t.isMemberExpression(attrValue.expression)) {
							refMember = attrValue.expression.property;
							refObject = attrValue.expression.object;
						} else if (t.isIdentifier(attrValue.expression)) {
							refMember = attrValue.expression;
						}
					} else {
						refMember = attrValue;
					}
					const assignToThis = t.assignmentExpression(
						'=',
						refObject
							? t.memberExpression(refObject, t.stringLiteral(refMember.name), true)
							: t.identifier(refMember.name),
						path.node
					);
					path.node.openingElement.attributes = restAttr;
					path.replaceWith(
						t.isJSXElement(path.parent) ? t.jsxExpressionContainer(assignToThis) as any : assignToThis
					);
				}
			}
		}
	};
};
