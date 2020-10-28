/// <reference path="../typings/babel.d.ts" />
import * as t from '@babel/types';
import jsx from '@babel/plugin-syntax-jsx';
import generate from '@babel/generator';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import templateLiteralVariables from './template-literal-variables';
import modify from './modify';
import check from './check';
import { declarationPathInScope, variableBindingInScope } from './export-registry';

export default (babel) => {
	return {
		inherits: jsx,
		visitor: {
			Program: {
				enter(path: t.NodePath<t.Program>, state: { key; filename; file }) {
					modify.insertFidanImport(path.node.body);
					path.traverse(jsxToTemplateLiteral(babel).visitor, state);
					// console.log(generate(path.node).code);
					path.traverse(templateLiteralVariables(babel).visitor, state); // TODO move to jsxToTemplateLiteral
					// console.log(generate(path.node).code);
				}
				// exit(path: t.NodePath<t.Program>, state: { key; filename; file }) {
				// 	debugger;
				// 	console.log(generate(path.node).code);
				// }
			},
			VariableDeclarator(path: t.NodePath<t.VariableDeclarator>) {
				if (check.isRequiredComputedExpression(path)) {
					path.node.init = modify.fidanComputedExpressionInit(path.node.init);
				} else if (
					t.isIdentifier(path.node.id) &&
					check.isVariableDeclaratorPathUsedInView(path, path.node.id)
				) {
					path.node.init = modify.fidanValueInit(path.node.init);
				}
			},
			ObjectProperty(path: t.NodePath<t.ObjectProperty>) {
				// https://github.com/ismail-codar/fidan/blob/b6f5dc4c0de4d8d799036b4447f7e316a1b5230c/packages/babel-plugin-fidan-jsx/src/index.ts#L139
				// a: b, a: b(), a: fidan.computed(...);
				let pathStr = '';
				const parentObjectExpressionPath = check.parentPathLoop<t.ObjectExpression>(path, (checkPath) => {
					if (t.isObjectProperty(checkPath.node) && t.isIdentifier(checkPath.node.key)) {
						pathStr += checkPath.node.key.name;
						pathStr += '.';
						return false;
					}
					return true;
				});
				pathStr = pathStr.substr(0, pathStr.length - 1);
				let parentArrayVariableDeclaratorPath: t.NodePath<t.VariableDeclarator> = null;
				if (
					t.isCallExpression(parentObjectExpressionPath.parentPath.node) &&
					t.isMemberExpression(parentObjectExpressionPath.parentPath.node.callee) &&
					t.isIdentifier(parentObjectExpressionPath.parentPath.node.callee.object) &&
					t.isIdentifier(parentObjectExpressionPath.parentPath.node.callee.property) // TODO property.name mutation method check
				) {
					// todolist -> todos.push({...
					parentArrayVariableDeclaratorPath = declarationPathInScope(
						parentObjectExpressionPath.parentPath.scope,
						parentObjectExpressionPath.parentPath.node.callee.object.name
					);
				} else {
					// todolist -> todos =  [{...}]
					parentArrayVariableDeclaratorPath = check.parentPathLoop<
						t.VariableDeclarator
					>(parentObjectExpressionPath, (checkPath) => t.isVariableDeclarator(checkPath.node));
				}
				if (parentArrayVariableDeclaratorPath) {
					const { arrayVariableDeclarationMaps } = parentArrayVariableDeclaratorPath.additionalInfo;
					if (arrayVariableDeclarationMaps) {
						for (var i = 0; i < arrayVariableDeclarationMaps.length; i++) {
							const memberExpressions =
								arrayVariableDeclarationMaps[i].additionalInfo
									.objectVariableDeclarationDynamicMemberExpressions;
							for (var m = 0; m < memberExpressions.length; m++) {
								let memberExprStr: string = generate(memberExpressions[m]).code;
								memberExprStr = memberExprStr.substr(memberExprStr.indexOf('.') + 1);
								if (memberExprStr === pathStr) {
									//TEST: todolist
									if (t.isLiteral(path.node.value) || t.isIdentifier(path.node.value)) {
										if (check.isRequiredComputedExpression(path)) {
											path.node.value = modify.fidanComputedExpressionInit(path.node.value);
										} else {
											path.node.value = modify.fidanValueInit(path.node.value);
										}
									} else if (
										t.isCallExpression(path.node.value) &&
										t.isMemberExpression(path.node.value.callee) &&
										check.isFidanMember(path.node.value.callee) === false
									) {
										check.unknownState(path);
									}
								}
							}
						}
					}
				}
			},
			ExpressionStatement(path: t.NodePath<t.ExpressionStatement>) {
				if (t.isAssignmentExpression(path.node.expression)) {
					const leftIsDynamic = check.isRequiredIdentifierFidanValAccess(path, path.node.expression.left);
					if (leftIsDynamic) {
						let rightIsDynamic = false;
						if (t.isIdentifier(path.node.expression.right)) {
							const initDeclarationPath = declarationPathInScope(
								path.scope,
								path.node.expression.right.name
							);
							rightIsDynamic = check.isRequiredIdentifierFidanValAccess(
								initDeclarationPath,
								path.node.expression.right
							);
						}
						if (!rightIsDynamic) {
							path.node.expression = modify.fidanValueSet(path.node.expression);
						}
					}
				} else if (t.isUpdateExpression(path.node.expression)) {
					if (
						t.isIdentifier(path.node.expression.argument) &&
						check.isRequiredIdentifierFidanValAccess(path, path.node.expression.argument)
					) {
						path.node.expression = modify.fidanValueSet(
							t.assignmentExpression(
								'=',
								path.node.expression.argument,
								t.binaryExpression(
									path.node.expression.operator.substr(0, 1) as any,
									path.node.expression.argument,
									t.numericLiteral(1)
								)
							)
						);
					}
				}
			},
			TaggedTemplateExpression(path: t.NodePath<t.TaggedTemplateExpression>) {
				path.node.quasi.expressions.forEach((expr, index) => {
					if (t.isCallExpression(expr)) {
						if (check.isComponentCall(path, expr)) {
							expr.arguments.forEach((arg) => {
								if (t.isObjectExpression(arg)) {
									arg.properties.forEach((prop, index) => {
										if (t.isObjectProperty(prop)) {
											if (t.isLiteral(prop.value)) {
												prop.value = modify.fidanValueInit(prop.value);
											}
										} else {
											check.unknownState(path);
										}
									});
								} else {
									check.unknownState(path);
									// throw 'component call parameter must be objectExpression: ' + generate(arg).code;
								}
							});
						} else {
							if (!check.nonComputedCallExpression(path, expr)) {
								path.node.quasi.expressions[index] = modify.fidanComputedExpressionInit(expr);
							}
						}
					} else if (t.isBinaryExpression(expr) || t.isConditionalExpression(expr)) {
						// todolist -> className={'cls_' + todo.title}
						path.node.quasi.expressions[index] = modify.fidanComputedExpressionInit(expr);
					}
				});
			},
			//  #region Identity a -> a()
			CallExpression(path: t.NodePath<t.CallExpression>) {
				path.node.arguments.forEach((arg, index) => {
					if (t.isIdentifier(arg) && check.isRequiredIdentifierFidanValAccess(path, arg)) {
						path.node.arguments[index] = modify.fidanValAccess(arg);
					}
				});
			},
			BinaryExpression(path: t.NodePath<t.BinaryExpression>) {
				if (t.isIdentifier(path.node.left) || t.isMemberExpression(path.node.left)) {
					if (check.isRequiredIdentifierFidanValAccess(path, path.node.left)) {
						path.node.left = modify.fidanValAccess(path.node.left);
					}
				} else {
					check.unknownState(path);
				}
				if (t.isIdentifier(path.node.right) || t.isMemberExpression(path.node.right)) {
					if (check.isRequiredIdentifierFidanValAccess(path, path.node.right)) {
						path.node.right = modify.fidanValAccess(path.node.right);
					}
				} else {
					check.unknownState(path);
				}
			}
			// #endregion Identity a -> a()
		}
	};
};
