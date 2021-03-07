import * as t from '@babel/types';
import check from './check';

const fidanValAccess = (node: t.Node) => {
  if (
    t.isLiteral(node) === false &&
    t.isObjectExpression(node) === false &&
    t.isArrowFunctionExpression(node) === false &&
    t.isTaggedTemplateExpression(node) === false &&
    t.isFunctionExpression(node) === false &&
    check.isFidanCall(node) === false
  ) {
    return t.callExpression(
      t.memberExpression(t.identifier('fidan'), t.identifier('arg')),
      [node as t.Expression]
    );
  } else {
    return node as t.Expression;
  }
};

const fidanValueInit = (init: t.Node) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('value')),
    [init == null ? t.nullLiteral() : (init as any)]
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

const fidanValueAssign = (expr: t.AssignmentExpression) => {
  return t.callExpression(
    t.memberExpression(t.identifier('fidan'), t.identifier('assign')),
    [expr.left as t.Expression, expr.right]
  );
};

const fidanBinary = (expr: t.Expression) => {
  if (t.isBinaryExpression(expr) || t.isLogicalExpression(expr)) {
    expr.left = fidanValAccess(fidanBinary(expr.left as t.Expression));
    expr.right = fidanValAccess(fidanBinary(expr.right));
  } else if (t.isUnaryExpression(expr)) {
    return fidanUnary(expr);
  } else if (t.isMemberExpression(expr) || t.isIdentifier(expr)) {
    return fidanValAccess(expr);
  }
  return expr;
};

const fidanUnary = (expr: t.UnaryExpression) => {
  expr.argument = fidanValAccess(expr.argument);
  return expr;
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
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier('fidan'))],
          t.stringLiteral('@fidanjs/runtime')
        )
      );
    }
  }
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
