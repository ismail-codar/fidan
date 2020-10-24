import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import { globalData } from '../common';
import { declarationPathInScope } from '../export-registry';
import modify from '../modify';
import check from '../check';

const pushDynamicPaths = (path: t.NodePath<t.Node>) => {
	let declarationPath: NodePath<t.Node> = null;
	if (t.isVariableDeclarator(path.node)) {
		modify.createAdditionalData(path);
		if (t.isBinaryExpression(path.node.init)) {
			if (t.isIdentifier(path.node.init.left)) {
				declarationPath = declarationPathInScope(path.parentPath.scope, path.node.init.left.name);
				pushDynamicPaths(declarationPath);
			}
			if (t.isIdentifier(path.node.init.right)) {
				declarationPath = declarationPathInScope(path.parentPath.scope, path.node.init.right.name);
				pushDynamicPaths(declarationPath);
			}
		} else if (t.isCallExpression(path.node.init) || t.isNewExpression(path.node.init)) {
			path.node.init.arguments.forEach((arg) => {
				if (t.isIdentifier(arg)) {
					declarationPath = declarationPathInScope(path.parentPath.scope, arg.name);
					pushDynamicPaths(declarationPath);
				} else {
					check.unknownState(path);
				}
			});
		} else if (
			!t.isLiteral(path.node.init) &&
			!t.isArrayExpression(path.node.init) &&
			!t.isObjectExpression(path.node.init)
		) {
			check.unknownState(path);
		}
	} else {
		check.unknownState(path);
	}
};

const findVariableReferencedPaths = (path: t.NodePath<t.Node>) => {
	if (t.isVariableDeclarator(path.node)) {
		const bindingNames = [];
		if (t.isIdentifier(path.node.id)) {
			bindingNames.push(path.node.id.name);
		} else if (t.isObjectPattern(path.node.id)) {
			path.node.id.properties.forEach((item) => {
				if (t.isObjectProperty(item) && t.isIdentifier(item.key)) {
					bindingNames.push(item.key.name);
				} else {
					check.unknownState(path);
				}
			});
		} else {
			check.unknownState(path);
		}
		pushDynamicPaths(path);
		bindingNames.forEach((bindingName) => {
			const referencePaths = path.scope.bindings[bindingName].referencePaths.slice(0);
			referencePaths.forEach((refPath) => {
				if (t.isIdentifier(refPath.node)) {
					const parentNode = refPath.parentPath.node;
					if (t.isVariableDeclarator(parentNode)) {
						pushDynamicPaths(refPath.parentPath);
					} else if (t.isAssignmentExpression(parentNode)) {
						if (t.isIdentifier(parentNode.left)) {
							const leftDeclarationPath = declarationPathInScope(
								refPath.parentPath.scope,
								parentNode.left.name
							);
							pushDynamicPaths(leftDeclarationPath);
						} else {
							check.unknownState(path);
						}
					} else if (!t.isMemberExpression(parentNode)) {
						check.unknownState(path);
					}
				} else {
					check.unknownState(path);
				}
			});
		});
	} else if (t.isIdentifier(path.node)) {
		// (todo) => ....
		pushDynamicPaths(path);
	} else {
		check.unknownState(path);
	}
};

const checkExpression = (path: t.NodePath<t.TaggedTemplateExpression>, expr: t.Expression) => {
	if (t.isIdentifier(expr)) {
		const bindingNodePath = path.scope.bindings[expr.name].path;
		findVariableReferencedPaths(bindingNodePath);
	} else if (t.isCallExpression(expr)) {
		expr.arguments.forEach((arg) => {
			if (t.isObjectExpression(arg)) {
				arg.properties.forEach((prop) => {
					if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
						const bindingNodePath = path.scope.bindings[prop.value.name].path;
						findVariableReferencedPaths(bindingNodePath);
					} else if (t.isObjectMethod(prop) || t.isSpreadElement(prop)) {
						check.unknownState(path);
					}
				});
			}
		});
		if (
			t.isMemberExpression(expr.callee) &&
			t.isIdentifier(expr.callee.object) &&
			t.isIdentifier(expr.callee.property) &&
			expr.callee.property.name === 'map'
		) {
			const bindingNodePath = path.scope.bindings[expr.callee.object.name].path;
			findVariableReferencedPaths(bindingNodePath);
		}
	} else if (t.isMemberExpression(expr)) {
		if (t.isIdentifier(expr.object)) {
			const bindingNodePath = path.scope.bindings[expr.object.name].path;
			modify.additionInfoToPath(bindingNodePath, expr);
			findVariableReferencedPaths(bindingNodePath);
			// TODO array...
		} else {
			check.unknownState(path);
		}
	} else if (t.isBinaryExpression(expr)) {
		//todolist -> className={'cls_' + todo.title}
		check.binaryExpressionItems(expr, (itemName) => {
			const bindingNodePath = path.scope.bindings[itemName].path;
			findVariableReferencedPaths(bindingNodePath);
		});
	} else if (t.isConditionalExpression(expr)) {
		checkExpression(path, expr.test);
	} else {
		check.unknownState(path);
	}
};

export default (babel) => {
	return {
		visitor: {
			TaggedTemplateExpression: (
				path: t.NodePath<t.TaggedTemplateExpression>,
				state: { key; filename; file }
			) => {
				path.node.quasi.expressions.forEach((expr) => {
					checkExpression(path, expr);
				});
			}
		}
	};
};
