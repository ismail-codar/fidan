import * as t from '@babel/types';
import generate from '@babel/generator';
import { variableBindingInScope } from './export-registry';

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
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  const callExpressionPath = parentPathLoop(path, checkPath => {
    return t.isCallExpression(checkPath);
  });
  return (
    !!callExpressionPath &&
    isFidanCall(callExpressionPath.node as t.CallExpression)
  );
};

export const isComponentName = (tagName: string) => {
  const idx = tagName.indexOf('.');
  if (idx !== -1) {
    tagName = tagName.substr(idx + 1);
  }
  return tagName.substr(0, 1) !== tagName.substr(0, 1).toLowerCase();
};

const parentComponentPath = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
): t.NodePath<t.VariableDeclarator | t.FunctionDeclaration> =>
  parentPathLoop(
    path,
    checkPath =>
      (t.isVariableDeclarator(checkPath.node) ||
        t.isFunctionDeclaration(checkPath.node)) &&
      t.isIdentifier(checkPath.node.id) &&
      isComponentName(checkPath.node.id.name)
  );

const declarationSource = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>,
  variableName: string
): t.Binding => {
  const binding = variableBindingInScope(path.scope, variableName);
  if (binding) {
    if (binding.kind === 'param') {
      return binding;
    }
    const nodeName = nodeInitName(binding.path.node);
    if (!nodeName) {
      return binding;
    }
    return declarationSource(path, nodeName);
  }
};

const nodeInitName = (node: t.Node): string => {
  if (t.isIdentifier(node)) {
    return node.name;
  } else if (t.isVariableDeclarator(node)) {
    if (t.isIdentifier(node.init)) {
      return node.init.name;
    } else if (t.isMemberExpression(node.init)) {
      if (t.isIdentifier(node.init.object)) {
        return node.init.object.name;
      }
    }
  } else {
    if (t.isObjectProperty(node) || t.isProperty(node)) {
      return node.value + ''; // TODO others...
    }
  }
};

const isComponentPropertyPath = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  const initName = nodeInitName(path.node);
  if (initName) {
    const declSource = declarationSource(path, initName);
    const parentCmp = parentComponentPath(declSource.path as any);
    if (parentCmp) {
      return true;
    }
  }
  return false;
};

const canBeObservable = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  const node = t.isVariableDeclarator(path.node)
    ? path.node.init
    : path.node.value;
  if (
    path.parentPath.parentPath &&
    isComponentCall(path.parentPath.parentPath.node)
  ) {
    return t.isLiteral(node);
  }
  return (
    t.isObjectExpression(node) === false &&
    t.isTaggedTemplateExpression(node) === false &&
    t.isArrowFunctionExpression(node) === false &&
    t.isFunctionExpression(node) === false &&
    isFidanCall(node) === false &&
    pathInTheComputedFn(path) === false &&
    path.parentPath &&
    t.isObjectPattern(path.parentPath.node) === false // const { value } = props
  );
};

const isComponentCall = (node: t.Node) => {
  return (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    isComponentName(node.callee.name) &&
    node.arguments.length === 1 &&
    t.isObjectExpression(node.arguments[0])
  );
};

export default {
  unknownState,
  isEmptyLiteral,
  isRequiredComputedExpression,
  isFidanCall,
  pathInTheComputedFn,
  canBeObservable,
  parentComponentPath,
  isComponentPropertyPath,
};
