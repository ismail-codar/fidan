import * as t from '@babel/types';

// https://github.com/ismail-codar/fidan/blob/master/packages/deprecated-babel-plugin-transform-jsx/src/modify.ts

const fidanValueInit = (init: t.Node) => {
	return t.callExpression(
		t.memberExpression(t.identifier('fidan'), t.identifier(t.isArrayExpression(init) ? 'array' : 'value')),
		[ init == null ? t.nullLiteral() : init as any ]
	);
};

const fidanValueSet = (expr: t.AssignmentExpression) => {
	if (t.isIdentifier(expr.left)) {
		return t.callExpression(expr.left, [ expr.right ]);
	}
};

const fidanComputedExpressionInit = (init: t.Expression) => {
	return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('computed')), [
		t.arrowFunctionExpression([], t.blockStatement([ t.returnStatement(init) ]))
	]);
};

const memberVal = (node: t.Node) => {
	if (t.isUnaryExpression(node)) {
		node.argument = t.memberExpression(node.argument, t.identifier('$val'));
		return node;
	} else return t.memberExpression(node as any, t.identifier('$val'));
};

const fidanValAccess = (node: t.Node) => {
	let name = null;
	if (t.isIdentifier(node)) {
		name = node.name;
	} else {
		debugger;
	}
	return t.callExpression(t.identifier(name), []);
};

// const fidanCall = (left: t.Expression | t.RestElement | t.LVal, right: t.Expression, operator: string) => {
// 	if (operator === '=') return t.callExpression(left as any, [ right ]);
// 	else {
// 		operator = operator.substr(0, 1);
// 		return t.callExpression(left as any, [ t.binaryExpression(operator as any, left as any, right) ]);
// 	}
// };

const insertFidanImport = (body: t.Node[], start: number) => {
	body.splice(
		start,
		0,
		t.importDeclaration(
			[ t.importSpecifier(t.identifier('fidan'), t.identifier('fidan')) ],
			t.stringLiteral('@fidanjs/runtime')
		)
	);
};

export default {
	fidanValueInit,
	fidanValueSet,
	memberVal,
	fidanValAccess,
	insertFidanImport,
	fidanComputedExpressionInit
};
