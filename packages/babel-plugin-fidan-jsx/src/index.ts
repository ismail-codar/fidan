/// <reference path="../typings/babel.d.ts" />
import * as t from '@babel/types';
import jsx from '@babel/plugin-syntax-jsx';
import generate from '@babel/generator';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import templateLiteralVariables from './template-literal-variables';
import modifiy from './modifiy';
import check from './check';
import { declarationPathInScope } from './export-registry';

export default (babel) => {
	return {
		inherits: jsx,
		visitor: {
			Program: {
				enter(path: t.NodePath<t.Program>, state: { key; filename; file }) {
					modifiy.insertFidanImport(path.node.body);
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
				if (
					t.isIdentifier(path.node.init) ||
					t.isLiteral(path.node.init) ||
					t.isArrayExpression(path.node.init) ||
					t.isNewExpression(path.node.init) ||
					t.isBinaryExpression(path.node.init) ||
					t.isObjectExpression(path.node.init) ||
					t.isCallExpression(path.node.init) // TODO or compute
				) {
					if (t.isIdentifier(path.node.id)) {
						const isDynamic = check.isPathDynamic(path);
						if (isDynamic) {
							let rightIsDynamic = false;
							if (t.isIdentifier(path.node.init)) {
								const initDeclarationPath = declarationPathInScope(path.scope, path.node.init.name);
								rightIsDynamic = check.isPathDynamic(initDeclarationPath);
							}
							if (!rightIsDynamic) {
								// if (check.isArrayVariableDeclarator(path.node)) {
								// 	modifiy.insertArrayInit(path);
								// }
								let dynamics = [];
								if (t.isNewExpression(path.node.init) || t.isCallExpression(path.node.init)) {
									dynamics = check.dynamicArguments(path, path.node.init.arguments);
								} else if (t.isObjectExpression(path.node.init)) {
									path.additionalInfo.memberExpressions.forEach((memberExpression) => {
										const objectProperty = check.objectPropertyFromMemberExpression(
											path.node.init as t.ObjectExpression,
											memberExpression
										);
										if (t.isObjectProperty(objectProperty)) {
											if (t.isLiteral(objectProperty.value)) {
												objectProperty.value = modifiy.fidanValueInit(objectProperty.value);
											} else {
												// TODO objectProperty.value can be binaryExpression vs... fidanComputedExpressionInit
												debugger;
											}
										} else {
											debugger;
										}
									});
								}
								if (
									dynamics.length ||
									t.isBinaryExpression(path.node.init) ||
									t.isCallExpression(path.node.init)
								) {
									path.node.init = modifiy.fidanComputedExpressionInit(path.node.init);
								} else {
									if (!path.additionalInfo) {
										//additionalInfo passed when template binding like obj.prop
										path.node.init = modifiy.fidanValueInit(path.node.init);
									}
								}
							}
						}
					} else {
						debugger;
					}
				} else if (!t.isArrowFunctionExpression(path.node.init)) {
					const isDynamic = check.isPathDynamic(path);
					if (isDynamic) {
						if (t.isBinaryExpression(path.node.init) || t.isCallExpression(path.node.init)) {
							path.node.init = modifiy.fidanComputedExpressionInit(path.node.init);
						} else if (t.isObjectExpression(path.node.init)) {
							debugger;
						} else {
							debugger;
						}
					}
				}
			},
			BinaryExpression(path: t.NodePath<t.BinaryExpression>) {
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
			CallExpression(path: t.NodePath<t.CallExpression>) {
				if (!check.isFidanCall(path.node)) {
					const dynamics = check.dynamicArguments(path, path.node.arguments);
					dynamics.forEach((arg, index) => {
						// TODO if function parameter is dynamic or not
						if (t.isIdentifier(arg)) {
							const isDynamic = check.isPathDynamic(path, arg.name);
							if (isDynamic) {
								path.node.arguments[index] = modifiy.fidanValAccess(arg);
							}
						} else if (!t.isLiteral(arg)) {
							debugger;
						}
					});
				}
			},
			ExpressionStatement(path: t.NodePath<t.ExpressionStatement>) {
				if (t.isAssignmentExpression(path.node.expression)) {
					const leftIsDynamic = check.isPathDynamic(path, path.node.expression.left['name']);
					if (leftIsDynamic) {
						let rightIsDynamic = false;
						if (t.isIdentifier(path.node.expression.right)) {
							const initDeclarationPath = declarationPathInScope(
								path.scope,
								path.node.expression.right.name
							);
							rightIsDynamic = check.isPathDynamic(initDeclarationPath);
						}
						if (!rightIsDynamic) {
							path.node.expression = modifiy.fidanValueSet(path.node.expression);
						}
					}
				} else if (t.isUpdateExpression(path.node.expression)) {
					if (
						t.isIdentifier(path.node.expression.argument) &&
						check.isPathDynamic(path, path.node.expression.argument.name)
					) {
						path.node.expression = modifiy.fidanValueSet(
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
												prop.value = modifiy.fidanValueInit(prop.value);
											}
										} else {
											debugger;
										}
									});
								} else {
									debugger;
									// throw 'component call parameter must be objectExpression: ' + generate(arg).code;
								}
							});
						} else {
							if (!check.nonComputedCallExpression(expr)) {
								path.node.quasi.expressions[index] = modifiy.fidanComputedExpressionInit(expr);
							}
						}
					}
				});
			}
		}
	};
};
