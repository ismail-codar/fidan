import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from '../common';

export default (babel) => {
	const dynamicPaths = globalData.dynamicPaths;
	return {
		visitor: {
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				dynamicPaths.push(path);
				// path.node.quasi.expressions -- > c
				// path.scope.bindings.c.path.node.init --> binaryExpression (a, b)
				//  dynamicPaths.push ... ath.scope.bindings.a.path,  ath.scope.bindings.b.path
				path.node.quasi.expressions.forEach((expr) => {
					if (t.isIdentifier(expr)) {
						const bindingNode = path.scope.bindings[expr.name].path.node;
						if (t.isVariableDeclarator(bindingNode)) {
							if (t.isIdentifier(bindingNode.init)) {
								debugger;
							} else if (t.isBinaryExpression(bindingNode.init)) {
								debugger;
							} else if (t.isCallExpression(bindingNode.init)) {
								debugger;
							} else {
								debugger;
							}
						} else {
							debugger;
						}
					} else if (t.isBinaryExpression(expr)) {
						debugger;
					} else if (t.isCallExpression(expr)) {
						debugger;
					} else {
						debugger;
					}
				});
			}
		}
	};
};
