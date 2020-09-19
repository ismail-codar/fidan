import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import { globalData } from '../common';
import { declarationPathInScope } from '../export-registry';

const pushDynamicPaths = (path: t.NodePath<t.Node>) => {
	const dynamicPaths = globalData.dynamicPaths;
	let declarationPath: NodePath<t.Node> = null;
	if (!dynamicPaths.includes(path)) {
		dynamicPaths.push(path);
		if (t.isVariableDeclarator(path.node)) {
			if (t.isIdentifier(path.node.init)) {
				debugger;
			} else if (t.isBinaryExpression(path.node.init)) {
				if (t.isIdentifier(path.node.init.left)) {
					declarationPath = declarationPathInScope(path.parentPath.scope, path.node.init.left.name);
					pushDynamicPaths(declarationPath);
				}
				if (t.isIdentifier(path.node.init.right)) {
					declarationPath = declarationPathInScope(path.parentPath.scope, path.node.init.right.name);
					pushDynamicPaths(declarationPath);
				}
			} else if (t.isCallExpression(path.node.init)) {
				path.node.init.arguments.forEach((arg) => {
					if (t.isIdentifier(arg)) {
						declarationPath = declarationPathInScope(path.parentPath.scope, arg.name);
						pushDynamicPaths(declarationPath);
					} else {
						debugger;
					}
				});
			} else if (!t.isLiteral(path.node.init)) {
				debugger;
			}
		} else {
			debugger;
		}
	}
};

const findVariableReferencedPaths = (path: t.NodePath<t.Node>) => {
	if (t.isVariableDeclarator(path.node)) {
		let bindingName = '';
		if (!bindingName) {
			if (t.isIdentifier(path.node.id)) {
				bindingName = path.node.id.name;
			} else {
				debugger;
			}
		}
		pushDynamicPaths(path);
		const referencePaths = path.scope.bindings[bindingName].referencePaths.slice(0);
		referencePaths.forEach((refPath) => {
			if (t.isIdentifier(refPath.node)) {
				const parentNode = refPath.parentPath.node;
				if (t.isVariableDeclarator(parentNode)) {
					pushDynamicPaths(refPath.parentPath);
				} else if (t.isAssignmentExpression(parentNode)) {
					if (t.isIdentifier(parentNode.left)) {
						debugger;
						const leftDeclarationPath = declarationPathInScope(
							refPath.parentPath.scope,
							parentNode.left.name
						);
						pushDynamicPaths(leftDeclarationPath);
					} else {
						debugger;
					}
				} else {
					debugger;
				}
			} else {
				debugger;
			}
		});
	} else {
		debugger;
	}
};

export default (babel) => {
	const dynamicPaths = globalData.dynamicPaths;
	return {
		visitor: {
			TaggedTemplateExpression: (
				path: t.NodePath<t.TaggedTemplateExpression>,
				state: { key; filename; file }
			) => {
				dynamicPaths.push(path);
				path.node.quasi.expressions.forEach((expr) => {
					if (t.isIdentifier(expr)) {
						const bindingNodePath = path.scope.bindings[expr.name].path;
						findVariableReferencedPaths(bindingNodePath);
					} else {
						debugger;
					}
				});
			}
		}
	};
};
