import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';

// https://github.com/ismail-codar/fidan/blob/master/packages/deprecated-babel-plugin-transform-jsx/src/modify.ts

const fidanValueInit = (init: t.Node) => {
	return t.callExpression(
		t.memberExpression(t.identifier('fidan'), t.identifier(t.isArrayExpression(init) ? 'array' : 'value')),
		[ init == null ? t.nullLiteral() : init as any ]
	);
};

const memberVal = (node: t.Node) => {
	if (t.isUnaryExpression(node)) {
		node.argument = t.memberExpression(node.argument, t.identifier('$val'));
		return node;
	} else return t.memberExpression(node as any, t.identifier('$val'));
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
	memberVal,
	insertFidanImport
};
