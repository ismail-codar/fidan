import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from '../common';

const findRelatedPaths = (path: NodePath<t.Node>, expr: t.Node) => {
	const dynamicPaths = globalData.dynamicPaths;
	if (t.isIdentifier(expr)) {
		const bindingNodePath = path.scope.bindings[expr.name].path;
		if (t.isVariableDeclarator(bindingNodePath.node)) {
			dynamicPaths.push(bindingNodePath);
			if (t.isIdentifier(bindingNodePath.node.init)) {
				debugger;
			} else if (t.isBinaryExpression(bindingNodePath.node.init)) {
				findRelatedPaths(bindingNodePath, bindingNodePath.node.init.left);
				findRelatedPaths(bindingNodePath, bindingNodePath.node.init.right);
			} else if (t.isCallExpression(bindingNodePath.node.init)) {
				bindingNodePath.node.init.arguments.forEach((arg) => {
					findRelatedPaths(path, arg);
				});
			} else if (!t.isLiteral(bindingNodePath.node.init)) {
				debugger;
			}
		} else {
			debugger;
		}
	} else if (t.isBinaryExpression(expr)) {
		findRelatedPaths(path, expr.left);
		findRelatedPaths(path, expr.right);
	} else if (t.isCallExpression(expr)) {
		expr.arguments.forEach((arg) => {
			findRelatedPaths(path, arg);
		});
	} else if (!t.isLiteral(expr)) {
		debugger;
	}
};

export default (babel) => {
	const dynamicPaths = globalData.dynamicPaths;
	return {
		visitor: {
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				dynamicPaths.push(path);
				path.node.quasi.expressions.forEach((expr) => {
					findRelatedPaths(path, expr);
				});
			}
		}
	};
};
