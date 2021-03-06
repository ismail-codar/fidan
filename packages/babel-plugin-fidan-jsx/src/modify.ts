import * as t from '@babel/types';

const fidanValAccess = (node: t.Node) => {
  let name = null;
  if (t.isIdentifier(node)) {
    name = node.name;
  } else {
    debugger;
  }
  return t.callExpression(t.identifier(name), []);
};

const fidanComputedExpressionInit = (init: t.Expression) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('computed')),
    [t.arrowFunctionExpression([], t.blockStatement([t.returnStatement(init)]))]
  );
};

const insertFidanImport = (body: t.Node[]) => {
  const imports = body.filter(item =>
    t.isImportDeclaration(item)
  ) as t.ImportDeclaration[];
  let exists =
    imports.length &&
    imports[0].specifiers.length &&
    imports[0].specifiers[0].local.name === 'fidan';
  if (!exists) {
    exists =
      body
        .filter(
          item =>
            item && typeof item === 'object' && t.isVariableDeclaration(item)
        )
        .map(
          (item: t.Node) =>
            t.isVariableDeclaration(item) && item.declarations[0].id['name']
        )
        .find(item => item === 'fidan') !== undefined;
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
          [t.importNamespaceSpecifier(t.identifier('fidan'))],
          t.stringLiteral('@fidanjs/runtime')
        )
      );
    }
  }
};

const fidanValueInit = (init: t.Node) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('value')),
    [init == null ? t.nullLiteral() : (init as any)]
  );
};

const fidanValueAssign = (expr: t.AssignmentExpression) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('assign')),
    [expr.left as t.Expression, expr.right]
  );
};

const fidanBinary = (expr: t.Expression) => {
  const args = t.isBinaryExpression(expr)
    ? [
        t.isBinaryExpression(expr.left) ? fidanBinary(expr.left) : expr.left,
        t.stringLiteral(expr.operator),
        t.isBinaryExpression(expr.right) ? fidanBinary(expr.right) : expr.right,
      ]
    : [expr];
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('binary')),
    args
  );
};

export default {
  fidanValueInit,
  fidanValAccess,
  insertFidanImport,
  fidanComputedExpressionInit,
  fidanValueAssign,
  fidanBinaryTest: fidanBinary,
};
