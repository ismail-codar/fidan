import * as t from '@babel/types';

const fidanValAccess = (node: t.Node) => {
  // let name = null;
  // if (t.isIdentifier(node)) {
  //   name = node.name;
  // } else {
  //   debugger;
  // }
  // return t.callExpression(t.identifier(name), []);
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('arg')),
    [node as t.Expression]
  );
};

const fidanComputedExpressionInit = (init: t.Expression) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('computed')),
    [t.arrowFunctionExpression([], t.blockStatement([t.returnStatement(init)]))]
  );
};

const fidanComputedFunction = (
  init: t.ArrowFunctionExpression | t.FunctionExpression
) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('computed')),
    [init]
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

const fidanBinaryArg = (expr: t.Expression) => {
  return t.isBinaryExpression(expr)
    ? fidanBinary(expr)
    : t.isUnaryExpression(expr)
    ? fidanUnary(expr)
    : t.isCallExpression(expr)
    ? t.arrowFunctionExpression([], expr)
    : expr;
};

const fidanBinary = (expr: t.Expression) => {
  if (t.isBinaryExpression(expr) || t.isLogicalExpression(expr)) {
    return t.callExpression(
      t.memberExpression(t.identifier('fidan'), t.identifier('binary')),
      [
        fidanBinaryArg(expr.left as t.Expression),
        t.stringLiteral(expr.operator),
        fidanBinaryArg(expr.right),
      ]
    );
  } else {
    return expr;
  }
};

const fidanUnary = (expr: t.UnaryExpression) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('unary')),
    [fidanBinary(expr.argument), t.stringLiteral(expr.operator)]
  );
};

export default {
  fidanValueInit,
  fidanValAccess,
  insertFidanImport,
  fidanComputedExpressionInit,
  fidanComputedFunction,
  fidanValueAssign,
  fidanBinary,
  fidanUnary,
};
