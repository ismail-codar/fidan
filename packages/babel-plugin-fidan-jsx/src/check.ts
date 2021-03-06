import * as t from '@babel/types';
import generate from '@babel/generator';

const unknownState = (path: t.NodePath<t.Node>, data?: any) => {
  // debugger;
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

export default {
  unknownState,
  isEmptyLiteral,
  isRequiredComputedExpression,
  isFidanCall,
};
