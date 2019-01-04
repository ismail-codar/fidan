import * as t from '@babel/types';
import { check } from './check';
import { Scope, NodePath } from 'babel-traverse';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import { found } from './found';

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

const fjsxComputeParametersInExpression = (
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
			} else if (check.isTrackedByNodeName(expression.property)) {
				const objectValue = expression as t.MemberExpression;
				if (!listIncludes(list, objectValue))
					listAddWithControl(scope, t.memberExpression(objectValue.object, objectValue.property), list);
			}
		}
		if (t.isIdentifier(expression.object)) {
			fjsxComputeParametersInExpression(scope, expression.object, list);
		}
	} else if (t.isBinaryExpression(expression)) checkBinaryExpression(scope, expression, list);
	else if (t.isLogicalExpression(expression)) checkLogicalExpression(scope, expression, list);
	else if (t.isConditionalExpression(expression)) checkConditionalExpression(scope, expression, list);
	else if (t.isUnaryExpression(expression)) fjsxComputeParametersInExpression(scope, expression.argument, list);
	else if (t.isCallExpression(expression)) {
		const methodName = t.isIdentifier(expression.callee) ? expression.callee.name : null;
		if (methodName) {
			let variableBinding = found.variableBindingInScope(scope, methodName);
			if (variableBinding) {
				if (t.isVariableDeclarator(variableBinding.path.node)) {
					if (t.isFunctionExpression(variableBinding.path.node.init))
						checkFunctionBody(
							expression.arguments,
							variableBinding.path.node.init.params,
							scope,
							variableBinding.path.node.init.body,
							list
						);
					else throw 'is not isFunctionExpression else ... not implemented ';
				} else if (t.isImportSpecifier(variableBinding.path.node)) {
					// debugger;
					// throw "not implemented imported callExpression";
				}
			}
		}
		checkExpressionList(scope, expression.arguments, list);
	} else if (t.isObjectExpression(expression)) checkExpressionList(scope, expression.properties, list);
};

const checkFunctionBody = (
	args: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName>,
	params: Array<t.LVal>,
	scope: Scope,
	body: t.BlockStatement,
	list: t.Expression[]
) => {
	traverse(
		body,
		{
			MemberExpression(path: NodePath<t.MemberExpression>, file) {
				if (!listIncludes(list, path.node as any)) {
					if (t.isIdentifier(path.node.object)) {
						const searchName = path.node.object.name;
						const argument = args[params.findIndex((p) => t.isIdentifier(p) && p.name == searchName)];
						if (
							argument &&
							t.isIdentifier(argument) &&
							check.isTrackedVariable(scope, path.node.property)
						) {
							list.push(t.memberExpression(argument, path.node.property));
						} else if (check.isTrackedVariable(scope, path.node.object)) {
							const variableBinding = found.variableBindingInScope(scope, searchName);
							// assuming that local variables cannot be found in passed scope
							// if the variableBinding is found it is not local variable in this function
							if (variableBinding) {
								list.push(path.node.object);
							}
						}
					}
				}
			}
		},
		scope
	);
};

const checkConditionalExpression = (scope: Scope, expression: t.ConditionalExpression, list: t.Expression[]) => {
	fjsxComputeParametersInExpression(scope, expression.test, list);
	if (t.isExpression(expression.consequent)) fjsxComputeParametersInExpression(scope, expression.consequent, list);
	if (t.isExpression(expression.alternate)) fjsxComputeParametersInExpression(scope, expression.alternate, list);
};

const checkBinaryExpression = (scope: Scope, expression: t.BinaryExpression, list: t.Expression[]) => {
	fjsxComputeParametersInExpression(scope, expression.left, list);
	fjsxComputeParametersInExpression(scope, expression.right, list);
};

const checkLogicalExpression = (scope: Scope, expression: t.LogicalExpression, list: t.Expression[]) => {
	fjsxComputeParametersInExpression(scope, expression.left, list);
	fjsxComputeParametersInExpression(scope, expression.right, list);
};

const checkExpressionList = (
	scope: Scope,
	argumentList: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ObjectMethod | t.ObjectProperty>,
	list: t.Expression[]
) => {
	argumentList.forEach((arg) => {
		if (t.isExpression(arg)) fjsxComputeParametersInExpression(scope, arg as t.Expression, list);
		else if (t.isObjectProperty(arg)) fjsxComputeParametersInExpression(scope, arg.value as t.Expression, list);
		else throw 'not implemented argument type in checkExpressionList';
	});
};

export const fjsxComputeParametersInExpressionWithScopeFilter = (
	scope: Scope,
	expression: t.Expression | t.PatternLike | t.JSXEmptyExpression
) => {
	const fComputeParameters = [];
	fjsxComputeParametersInExpression(scope, expression, fComputeParameters);
	return fComputeParameters;
};

export const parameters = {
	fjsxComputeParametersInExpressionWithScopeFilter
};
