import * as t from '@babel/types';

const fidanValueInit = (init: t.Node) => {
	return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('value')), [
		init == null ? t.nullLiteral() : init as any
	]);
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

const insertFidanImport = (body: t.Node[]) => {
	const imports = body.filter((item) => t.isImportDeclaration(item)) as t.ImportDeclaration[];
	let exists = imports.length && imports[0].specifiers.length && imports[0].specifiers[0].local.name === 'fidan';
	if (!exists) {
		exists =
			body
				.filter((item) => item && typeof item === 'object' && t.isVariableDeclaration(item))
				.map((item: t.VariableDeclaration) => item.declarations[0].id['name'])
				.find((item) => item === 'fidan') !== undefined;
		if (!exists) {
			body.splice(
				0,
				0,
				// t.variableDeclaration('var', [
				// 	t.variableDeclarator(
				// 		t.identifier('fidan'),
				// 		t.callExpression(t.identifier('require'), [ t.stringLiteral('@fidanjs/runtime') ])
				// 	)
				// ])
				t.importDeclaration(
					[ t.importNamespaceSpecifier(t.identifier('fidan')) ],
					t.stringLiteral('@fidanjs/runtime')
				)
			);
		}
	}
};

export default {
	fidanValueInit,
	fidanValueSet,
	memberVal,
	fidanValAccess,
	insertFidanImport,
	fidanComputedExpressionInit
};
