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

const fidanValueSet = (expr: t.AssignmentExpression) => {
  if (t.isIdentifier(expr.left)) {
    return t.callExpression(expr.left, [expr.right]);
  }
};

export default {
  fidanValueInit,
  fidanValAccess,
  fidanValueSet,
  insertFidanImport,
  fidanComputedExpressionInit,
};
