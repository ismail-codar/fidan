import * as t from '@babel/types';
import generate from '@babel/generator';

const unknownState = (path: t.NodePath<t.Node>, data?: any) => {
  // debugger;
};

const parentPathLoop = <T>(
  path: t.NodePath<t.Node>,
  check: (path: t.NodePath<t.Node>) => boolean
): t.NodePath<T> => {
  while (true) {
    if (path == null || t.isProgram(path.node)) {
      return null;
    }
    if (check(path)) {
      return path as any;
    }
    path = path.parentPath;
  }

  return null;
};

const isEmptyLiteral = (literal: t.TemplateLiteral) => {
  return literal.quasis.length == 1 && literal.quasis[0].value.raw === '';
};

const isRequiredComputedExpression = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty>
) => {
  const expr = t.isVariableDeclarator(path.node)
    ? path.node.init
    : path.node.value;
  return (
    t.isNewExpression(expr) ||
    t.isCallExpression(expr) ||
    t.isBinaryExpression(expr)
  );
};

const isFidanCall = (node: t.Node) => {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object) &&
    node.callee.object.name === 'fidan'
  );
};

const pathInTheComputedFn = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty>
) => {
  const callExpressionPath = parentPathLoop(path, checkPath => {
    return t.isCallExpression(checkPath);
  });
  return (
    !!callExpressionPath &&
    isFidanCall(callExpressionPath.node as t.CallExpression)
  );
};

export default {
  unknownState,
  isEmptyLiteral,
  isRequiredComputedExpression,
  isFidanCall,
  pathInTheComputedFn,
};
