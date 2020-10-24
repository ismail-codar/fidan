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
				let dynamics = [];
				if (t.isNewExpression(path.node.init) || t.isCallExpression(path.node.init)) {
					dynamics = check.dynamicArguments(path, path.node.init.arguments);
				}
				if (dynamics.length || t.isBinaryExpression(path.node.init) || t.isCallExpression(path.node.init)) {
					path.node.init = modify.fidanComputedExpressionInit(path.node.init);
				} else {
					if (check.isPathDynamic(path)) {
						path.node.init = modify.fidanValueInit(path.node.init);
					}
				}
			},
			ObjectProperty(path: t.NodePath<t.ObjectProperty>) {
				// a: b, a: b(), a: fidan.computed(...);
			},
			MemberExpression(path: t.NodePath<t.MemberExpression>) {
				// .a, .a()
				// modify.fidanValAccess(node)
			},
			ArrayExpression(path: t.NodePath<t.ArrayExpression>) {},
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
							path.node.expression = modify.fidanValueSet(path.node.expression);
						}
					}
				} else if (t.isUpdateExpression(path.node.expression)) {
					if (
						t.isIdentifier(path.node.expression.argument) &&
						check.isPathDynamic(path, path.node.expression.argument.name)
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
			// Identity a -> a()
			CallExpression(path: t.NodePath<t.CallExpression>) {
				path.node.arguments.forEach((arg, index) => {
					if (t.isIdentifier(arg)) {
						const bindingNodePath = path.scope.bindings[arg.name].path;
						if (t.isVariableDeclarator(bindingNodePath.node) && check.isPathDynamic(bindingNodePath)) {
							path.node.arguments[index] = modify.fidanValAccess(arg);
						}
					}
				});
			}
		}
	};
};
