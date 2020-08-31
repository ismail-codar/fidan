import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import jsx from '@babel/plugin-syntax-jsx';
import { globalData } from './common';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import templateLiteralVariables from './template-literal-variables';
import modifiy from './modifiy';
import check from './check';

export default (babel) => {
	return {
		inherits: jsx,
		visitor: {
			Program(path: NodePath<t.Program>, state: { key; filename; file }) {
				path.traverse(jsxToTemplateLiteral(babel).visitor, state);
				path.traverse(templateLiteralVariables(babel).visitor, state); // TODO move to jsxToTemplateLiteral
			},
			VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
				if (t.isIdentifier(path.node.init) || t.isLiteral(path.node.init)) {
					if (t.isIdentifier(path.node.id)) {
						const isDynamic = check.isPathDynamic(path);
						if (isDynamic) {
							path.node.init = modifiy.fidanValueInit(path.node.init);
						}
					} else {
						debugger;
					}
				} else if (!t.isArrowFunctionExpression(path.node.init)) {
					const isDynamic = check.isPathDynamic(path);
					if (isDynamic) {
						if (t.isBinaryExpression(path.node.init)) {
							path.node.init = modifiy.fidanComputedBinaryExpressionInit(path.node.init);
						} else if (t.isCallExpression(path.node.init)) {
							debugger;
						} else {
							debugger;
						}
					}
				}
			},
			BinaryExpression(path: NodePath<t.BinaryExpression>) {
				if (t.isIdentifier(path.node.left)) {
					const isDynamic = check.isPathDynamic(path, path.node.left.name);
					if (isDynamic) {
						path.node.left = modifiy.fidanValAccess(path.node.left);
					}
				}
				if (t.isIdentifier(path.node.right)) {
					const isDynamic = check.isPathDynamic(path, path.node.right.name);
					if (isDynamic) {
						path.node.right = modifiy.fidanValAccess(path.node.right);
					}
				}
			},
			CallExpression(path: NodePath<t.CallExpression>) {
				if (!check.isFidanCall(path.node)) {
					path.node.arguments.forEach((arg, index) => {
						if (t.isIdentifier(arg)) {
							const isDynamic = check.isPathDynamic(path, arg.name);
							if (isDynamic) {
								path.node.arguments[index] = modifiy.fidanValAccess(arg);
							}
						} else {
							debugger;
						}
					});
				}
			}
		}
	};
};
