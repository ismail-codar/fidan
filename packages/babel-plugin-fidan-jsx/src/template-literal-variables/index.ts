import * as t from '@babel/types';
import { declarationPathInScope } from '../export-registry';
import modify from '../modify';
import check from '../check';
import additionalInfo from '../additional-info';
import generate from '@babel/generator';
import { globalData } from '../common';

const findVariableReferencedPaths = (path: t.NodePath<t.Node>) => {
	// modify.createAdditionalData(path);
	// console.info('findVariableReferencedPaths: ' + generate(path.node).code);
	if (t.isIdentifier(path.node)) {
		additionalInfo.createCheck(path);
		const bindingNodePath = path.scope.bindings[path.node.name];
		if (!bindingNodePath) {
			return;
		}
		bindingNodePath.referencePaths.forEach((refPath) => {
			if (t.isIdentifier(refPath.node)) {
				const parentNode = refPath.parentPath.node;
				if (t.isVariableDeclarator(parentNode)) {
					additionalInfo.createCheck(refPath.parentPath);
				} else if (t.isAssignmentExpression(parentNode)) {
					if (t.isIdentifier(parentNode.left)) {
						const leftDeclarationPath = declarationPathInScope(
							refPath.parentPath.scope,
							parentNode.left.name
						);
						additionalInfo.createCheck(leftDeclarationPath);
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
	} else if (t.isVariableDeclarator(path.node)) {
		additionalInfo.createCheck(path);
		if (t.isIdentifier(path.node.id)) {
			// const a = 1
			const referencePaths = path.scope.bindings[path.node.id.name].referencePaths.slice(0);
			referencePaths.forEach((refPath) => {
				findVariableReferencedPaths(refPath);
			});
		} else if (t.isObjectPattern(path.node.id)) {
			//prop-1 -> const { value, text } = props;
			path.node.id.properties.forEach((item) => {
				if (t.isObjectProperty(item) && t.isIdentifier(item.key) && path.scope.bindings[item.key.name]) {
					const referencePaths = path.scope.bindings[item.key.name].referencePaths.slice(0);
					referencePaths.forEach((refPath) => {
						findVariableReferencedPaths(refPath);
					});
				} else {
					check.unknownState(path);
				}
			});
		} else {
			check.unknownState(path);
		}
	} else {
		check.unknownState(path);
	}
};

const checkTemplateExpression = (
	path: t.NodePath<t.TaggedTemplateExpression>,
	expr: t.BlockStatement | t.Expression
) => {
	// console.log('checkTemplateExpression: ' + generate(expr).code);
	if (t.isIdentifier(expr)) {
		const bindingNodePath = path.scope.bindings[expr.name].path;
		findVariableReferencedPaths(bindingNodePath);
	} else if (t.isCallExpression(expr)) {
		expr.arguments.forEach((arg) => {
			if (t.isObjectExpression(arg)) {
				arg.properties.forEach((prop) => {
					if (
						t.isObjectProperty(prop) &&
						t.isIdentifier(prop.value) &&
						path.scope.bindings[prop.value.name]
					) {
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
		if (t.isIdentifier(expr.object) && path.scope.bindings[expr.object.name]) {
			const bindingNodePath = path.scope.bindings[expr.object.name].path;
			// object-property-1
			bindingNodePath.additionalInfo.objectVariableDeclaratorDynamicMemberExpressions.push(expr);
			findVariableReferencedPaths(bindingNodePath);
		} else {
			check.unknownState(path);
		}
	} else if (t.isBinaryExpression(expr)) {
		//todolist -> className={'cls_' + todo.title}
		check.binaryExpressionItems(expr, (item) => {
			if (path.scope.bindings[item.name]) {
				const bindingNodePath = path.scope.bindings[item.name].path;
				findVariableReferencedPaths(bindingNodePath);
			}
			return true;
		});
	} else if (t.isConditionalExpression(expr)) {
		checkTemplateExpression(path, expr.test);
	} else if (t.isArrowFunctionExpression(expr)) {
		checkTemplateExpression(path, expr.body);
	} else {
		check.unknownState(path);
	}
};

export default (babel) => {
	return {
		visitor: {
			TaggedTemplateExpression: {
				enter: (path: t.NodePath<t.TaggedTemplateExpression>) => {
					globalData.isInTaggedTemplateExpression = true;
					path.node.quasi.expressions.forEach((expr) => {
						checkTemplateExpression(path, expr);
					});
				},
				exit: (path: t.NodePath<t.TaggedTemplateExpression>) => {
					globalData.isInTaggedTemplateExpression = false;
				}
			},
			CallExpression: (path: t.NodePath<t.CallExpression>) => {
				if (t.isIdentifier(path.node.callee)) {
					const calleName = path.node.callee.name;
					const scopedPath = check.parentPathLoop(path, (checkPath) => {
						return checkPath.scope.bindings[calleName] !== undefined;
					});
					if (scopedPath) {
						const callExpressionDeclarationPath = scopedPath.scope.bindings[calleName].path;
						additionalInfo.createCheck(callExpressionDeclarationPath);
						path.node.arguments.forEach((arg) => {
							if (t.isIdentifier(arg)) {
								// TODO isDynamic
								callExpressionDeclarationPath.additionalInfo.callExpressionDeclaratorDynamicParams.push(
									arg.name
								);
							} else {
								check.unknownState(path, arg);
							}
						});
					}
				} else if (t.isMemberExpression(path.node.callee)) {
					if (
						t.isIdentifier(path.node.callee.property) &&
						path.node.callee.property.name === 'map' &&
						t.isIdentifier(path.node.callee.object)
					) {
						const arrayVariableDeclaratorPath = path.scope.bindings[path.node.callee.object.name]
							.path as t.NodePath<t.VariableDeclarator>;
						//TEST: todolist
						additionalInfo.createCheck(path);
						arrayVariableDeclaratorPath.additionalInfo.arrayVariableDeclarationMaps.push(path);
					}
				} else {
					check.unknownState(path);
				}
			},
			VariableDeclarator: (path: t.NodePath<t.VariableDeclarator>) => {
				for (var bindingName in path.scope.bindings) {
					path.scope.bindings[bindingName].referencePaths.forEach((refPath) => {
						additionalInfo.createCheck(refPath.parentPath);
						refPath.parentPath.additionalInfo.referencedVariableDeclaratorPath = refPath;
					});
				}
			}
		}
	};
};
