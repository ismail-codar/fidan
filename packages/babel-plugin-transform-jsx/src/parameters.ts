import * as t from '@babel/types';
import { check } from './check';
import { Scope, NodePath } from 'babel-traverse';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import { found } from './found';
import { exportRegistry } from './export-registry';

const listIncludes = (list: t.Expression[], item: t.Expression) => {
	var itemCode: string = generate(item).code;
	if (itemCode.endsWith('.$val')) itemCode = itemCode.substr(0, itemCode.length - 5);
	return (
		list.find((listItem) => {
			var listItemCode = generate(listItem).code;
			if (listItemCode.endsWith('.$val')) listItemCode = listItemCode.substr(0, listItemCode.length - 5);
			return itemCode === listItemCode;
		}) != undefined
	);
};

const listAddWithControl = (scope: Scope, expression: t.Expression, list: t.Expression[]) => {
	if (check.isValMemberProperty(expression)) list.push(expression.object);
	else if (check.isTrackedVariable(scope, expression)) list.push(expression);
};

const fidanComputeParametersInExpression = (
	fileName: string,
	scope: Scope,
	expression: t.Expression | t.PatternLike | t.JSXEmptyExpression,
	list: t.Expression[]
): void => {
	if (t.isIdentifier(expression)) {
		if (!listIncludes(list, expression)) listAddWithControl(scope, expression, list);
	}
	if (t.isMemberExpression(expression)) {
		if (t.isIdentifier(expression.property)) {
			if (expression.property.name === '$val') {
				const objectValue = expression as t.MemberExpression;
				if (!listIncludes(list, objectValue)) listAddWithControl(scope, objectValue, list);
			} else if (check.isTrackedVariable(scope, expression.property)) {
				const objectValue = expression as t.MemberExpression;
				if (!listIncludes(list, objectValue))
					listAddWithControl(scope, t.memberExpression(objectValue.object, objectValue.property), list);
			}
		}
		if (t.isIdentifier(expression.object)) {
			fidanComputeParametersInExpression(fileName, scope, expression.object, list);
		}
	} else if (t.isBinaryExpression(expression)) checkBinaryExpression(fileName, scope, expression, list);
	else if (t.isLogicalExpression(expression)) checkLogicalExpression(fileName, scope, expression, list);
	else if (t.isConditionalExpression(expression)) checkConditionalExpression(fileName, scope, expression, list);
	else if (t.isUnaryExpression(expression))
		fidanComputeParametersInExpression(fileName, scope, expression.argument, list);
	else if (t.isCallExpression(expression)) {
		const methodName = t.isIdentifier(expression.callee) ? expression.callee.name : null;
		if (methodName) {
			let variableBinding = found.variableBindingInScope(scope, methodName);
			if (variableBinding) {
				if (
					t.isVariableDeclarator(variableBinding.path.node) ||
					t.isFunctionDeclaration(variableBinding.path.node)
				) {
					const nodeOrInit = t.isVariableDeclarator(variableBinding.path.node)
						? variableBinding.path.node.init
						: variableBinding.path.node;
					if (
						t.isFunctionExpression(nodeOrInit) ||
						t.isArrowFunctionExpression(nodeOrInit) ||
						t.isFunctionDeclaration(nodeOrInit)
					)
						checkFunctionBody(expression.arguments, nodeOrInit.params, scope, nodeOrInit.body, list);
					else
						throw 'ERROR: is not isFunctionExpression || isArrowFunctionExpression else ... not implemented -> ' +
							variableBinding.path.node.type;
				} else if (t.isImportSpecifier(variableBinding.path.node)) {
					// TODO isImportSpecifier
					const exported = exportRegistry.loadImportedFileExports(
						fileName,
						variableBinding.path.parent['source'].value
					);
					exported.nodes.forEach((node) => {
						fidanComputeParametersInExpression(exported.fileName, scope, node as any, list);
					});
				} else
					throw 'ERROR: t.isVariableDeclarator(variableBinding.path.node) else ... not implemented -> ' +
						variableBinding.path.node.type;
			}
		}
		checkExpressionList(fileName, scope, expression.arguments, list);
	} else if (t.isObjectExpression(expression)) checkExpressionList(fileName, scope, expression.properties, list);
};

const checkFunctionBody = (
	args: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName>,
	params: Array<t.LVal>,
	scope: Scope,
	body: t.BlockStatement | t.Expression,
	list: t.Expression[]
) => {
	traverse(
		body,
		{
			MemberExpression(path: NodePath<t.MemberExpression>, file) {
				if (t.isIdentifier(path.node.object)) {
					const searchName = path.node.object.name;
					const argument = args[params.findIndex((p) => t.isIdentifier(p) && p.name == searchName)];
					let listItem = null;
					if (argument && t.isIdentifier(argument) && check.isTrackedVariable(scope, path.node.property)) {
						listItem = t.memberExpression(argument, path.node.property);
					} else if (check.isTrackedVariable(scope, path.node.object)) {
						const variableBinding = found.variableBindingInScope(scope, searchName);
						// assuming that local variables cannot be found in passed scope
						// if the variableBinding is found it is not local variable in this function
						if (variableBinding) {
							listItem = path.node.object;
						}
					} else if (check.isTrackedVariable(scope, path.node.property)) {
						listItem = t.memberExpression(path.node.object, path.node.property);
					}
					if (listItem && !listIncludes(list, listItem)) {
						list.push(listItem);
					}
				}
			}
		},
		scope
	);
};

const checkConditionalExpression = (
	fileName: string,
	scope: Scope,
	expression: t.ConditionalExpression,
	list: t.Expression[]
) => {
	fidanComputeParametersInExpression(fileName, scope, expression.test, list);
	if (t.isExpression(expression.consequent))
		fidanComputeParametersInExpression(fileName, scope, expression.consequent, list);
	if (t.isExpression(expression.alternate))
		fidanComputeParametersInExpression(fileName, scope, expression.alternate, list);
};

const checkBinaryExpression = (
	fileName: string,
	scope: Scope,
	expression: t.BinaryExpression,
	list: t.Expression[]
) => {
	fidanComputeParametersInExpression(fileName, scope, expression.left, list);
	fidanComputeParametersInExpression(fileName, scope, expression.right, list);
};

const checkLogicalExpression = (
	fileName: string,
	scope: Scope,
	expression: t.LogicalExpression,
	list: t.Expression[]
) => {
	fidanComputeParametersInExpression(fileName, scope, expression.left, list);
	fidanComputeParametersInExpression(fileName, scope, expression.right, list);
};

const checkExpressionList = (
	fileName: string,
	scope: Scope,
	argumentList: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ObjectMethod | t.ObjectProperty>,
	list: t.Expression[]
) => {
	argumentList.forEach((arg) => {
		if (t.isExpression(arg)) fidanComputeParametersInExpression(fileName, scope, arg as t.Expression, list);
		else if (t.isObjectProperty(arg))
			fidanComputeParametersInExpression(fileName, scope, arg.value as t.Expression, list);
		else throw 'ERROR: not implemented argument type in checkExpressionList';
	});
};

export const fidanComputeParametersInExpressionWithScopeFilter = (
	fileName: string,
	scope: Scope,
	expression: t.Expression | t.PatternLike | t.JSXEmptyExpression
) => {
	const fComputeParameters = [];
	fidanComputeParametersInExpression(fileName, scope, expression, fComputeParameters);
	return fComputeParameters;
};

export const parameters = {
	checkFunctionBody,
	fidanComputeParametersInExpressionWithScopeFilter
};
