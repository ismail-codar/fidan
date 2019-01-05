import * as babylon from 'babylon';
import traverse from '@babel/traverse';
import { NodePath, Scope } from 'babel-traverse';
import * as t from '@babel/types';
import { check } from './check';
import { parameters } from './parameters';

const fidanValueInit = (init: t.Expression | t.PatternLike | t.SpreadElement | t.JSXNamespacedName) => {
	return t.callExpression(
		t.memberExpression(t.identifier('fidan'), t.identifier(t.isArrayExpression(init) ? 'array' : 'value')),
		[ init == null ? t.nullLiteral() : init as any ]
	);
};

const fidanCall = (left: t.Expression | t.RestElement | t.LVal, right: t.Expression, operator: string) => {
	if (operator === '=') return t.callExpression(left as any, [ right ]);
	else {
		operator = operator.substr(0, 1);
		return t.callExpression(left as any, [ t.binaryExpression(operator as any, left as any, right) ]);
	}
};

const assignmentExpressionToCallCompute = (expression: t.AssignmentExpression, fComputeParameters: any[]) => {
	if (
		t.isMemberExpression(expression.left) &&
		t.isIdentifier(expression.left.object) &&
		expression.left.property.name === '$val'
	)
		return t.callExpression(
			t.memberExpression(t.identifier('fidan'), t.identifier('compute')),
			[
				t.functionExpression(
					t.identifier(''),
					[],
					t.blockStatement([
						t.expressionStatement(t.callExpression(expression.left.object, [ expression.right ]))
					])
				)
			].concat(fComputeParameters)
		);
};

const dynamicExpressionInitComputeValues = (expression: t.Expression | t.PatternLike, fComputeParameters: any[]) => {
	return t.callExpression(
		t.memberExpression(t.identifier('fidan'), t.identifier('initCompute')),
		[
			t.functionExpression(t.identifier(''), [], t.blockStatement([ t.returnStatement(expression as any) ]))
		].concat(fComputeParameters)
	);
};

const fidanAssignmentExpressionSetCompute = (expression: t.AssignmentExpression, fComputeParameters: any[]) => {
	const leftName = t.isIdentifier(expression.left) ? expression.left.name : 'TODO';
	return t.callExpression(
		t.memberExpression(t.identifier('fidan'), t.identifier('setCompute')),
		[
			t.identifier(leftName),
			t.functionExpression(t.identifier(''), [], t.blockStatement([ t.returnStatement(expression.right) ]))
		].concat(fComputeParameters)
	);
};

const expressionStatementGeneralProcess = (propertyName: string, path: NodePath<any>) => {
	const expression: t.Expression = path.node[propertyName];
	if (t.isAssignmentExpression(expression)) {
		// const code = generate(path.node).code;
		const isExport = check.isExportsMember(expression.left);
		if (t.isMemberExpression(expression.left) && !isExport) {
			const rightIsFidanCall = check.isFidanCall(expression.right);
			if (rightIsFidanCall) return;

			const leftIsTracked = check.isTrackedVariable(path.scope, expression.left);
			const rightIsTracked = check.isTrackedVariable(path.scope, expression.right);
			if (leftIsTracked && expression.left.object.type === 'ThisExpression') {
				// class-property-1
				if (rightIsTracked) return;
				else {
					if (check.isDynamicExpression(expression.right)) {
						const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
							path.scope,
							expression.right
						);
						if (fComputeParameters.length > 0) {
							expression.right = dynamicExpressionInitComputeValues(expression.right, fComputeParameters);
							return;
						}
					}
					expression.right = fidanValueInit(expression.right);
					return;
				}
			}

			if (rightIsTracked) {
				if (leftIsTracked) {
					path.node[propertyName] = modify.fidanCall(expression.left, expression.right, expression.operator);
				}
			} else {
				if (leftIsTracked) {
					path.node[propertyName] = modify.fidanCall(expression.left, expression.right, expression.operator);
				}
			}
		}
		if (check.isTrackedByNodeName(expression.left) && t.isBinaryExpression(expression.right)) {
			// variable-binary-call-1 setCompute
			const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
				path.scope,
				expression.right
			);
			const containsAnotherTracked =
				fComputeParameters.find((param) => {
					const node = t.isMemberExpression(param) ? param.object : param;
					if (t.isIdentifier(node) && t.isIdentifier(expression.left)) {
						if (node.name === expression.left.name) {
							return false;
						}
					}
					return check.isTrackedByNodeName(node);
				}) != null;
			if (containsAnotherTracked) {
				expression.right = modify.fidanAssignmentExpressionSetCompute(expression, fComputeParameters);
			} else {
				// export-1
				path.node[propertyName] = modify.fidanCall(expression.left, expression.right, expression.operator);
			}
		} else if (!isExport && t.isAssignmentExpression(expression)) {
			const leftIsTracked = check.isTrackedVariable(path.scope, expression.left);
			const rightIsTracked = check.isTrackedVariable(path.scope, expression.right);

			if (
				leftIsTracked &&
				!(t.isMemberExpression(expression.left) && expression.left.object.type === 'ThisExpression')
			)
				path.node[propertyName] = modify.fidanCall(expression.left, expression.right, expression.operator);
			else if (rightIsTracked && !check.isExportsMember(expression.left)) {
				expression.right = modify.memberVal(expression.right);
			}
		}
	} else if (t.isUpdateExpression(expression)) {
		if (check.isTrackedVariable(path.scope, expression.argument)) {
			path.node[propertyName] = modify.fidanCall(expression.argument, t.numericLiteral(1), expression.operator);
		}
	}
};

const memberVal = (expression: t.Expression | t.SpreadElement | t.JSXNamespacedName | t.PatternLike) => {
	if (t.isUnaryExpression(expression)) {
		expression.argument = t.memberExpression(expression.argument, t.identifier('$val'));
		return expression;
	} else return t.memberExpression(expression as any, t.identifier('$val'));
};

const renameToVal = (node: t.MemberExpression, property) => {
	node[property] = t.identifier('$val');
};

export const moveContextArguments = (args: any[], contextArgIndex: number) => {
	const contextArgProps: any[] = args[contextArgIndex].arguments[1].properties;
	const contextArgs = args[contextArgIndex].arguments.splice(2);
	contextArgs.push(
		t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('endContext')), [
			contextArgProps[0].value
		])
	);
	args[contextArgIndex] = t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('startContext')), [
		contextArgProps[0].value,
		contextArgProps[1].value
	]);
	args.splice.apply(args, [ contextArgIndex + 1, 0 ].concat(contextArgs));
};

export const pathNodeLeftRight = (path: NodePath<t.LogicalExpression | t.BinaryExpression>) => {
	if (t.isIdentifier(path.node.left)) {
		if (check.isTrackedVariable(path.scope, path.node.left)) {
			path.node.left = modify.memberVal(path.node.left);
		}
	} else if (t.isMemberExpression(path.node.left)) {
		if (check.isTrackedVariable(path.scope, path.node.left)) {
			path.node.left = modify.memberVal(path.node.left);
		}
	}
	if (t.isIdentifier(path.node.right)) {
		if (check.isTrackedVariable(path.scope, path.node.right)) {
			path.node.right = modify.memberVal(path.node.right);
		}
	} else if (t.isMemberExpression(path.node.right)) {
		if (check.isTrackedVariable(path.scope, path.node.right)) {
			path.node.right = modify.memberVal(path.node.right);
		}
	}
};

export const modify = {
	fidanValueInit,
	fidanCall,
	memberVal,
	renameToVal,
	dynamicExpressionInitComputeValues,
	assignmentExpressionToCallCompute,
	fidanAssignmentExpressionSetCompute,
	expressionStatementGeneralProcess,
	moveContextArguments,
	pathNodeLeftRight
};
