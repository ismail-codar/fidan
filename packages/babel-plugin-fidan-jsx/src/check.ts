import * as t from '@babel/types';
import generate from '@babel/generator';
import { declarationPathInScope } from './export-registry';

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
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  const nodeInit = t.isVariableDeclarator(path.node)
    ? path.node.init
    : t.isObjectProperty(path.node) || t.isProperty(path.node)
    ? path.node.value
    : null;
  if (nodeInit && t.isIdentifier(nodeInit)) {
    const binding = declarationPathInScope(path.scope, nodeInit.name);
    if (binding && binding.node && t.isVariableDeclarator(binding.node)) {
      // return declarationSource(binding.parentPath);
      console.log(generate(binding.node as any).code);
      debugger;
    }
  }
};

const isComponentProperty = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  const parentFunctionPath = parentComponentPath(path);
  if (parentFunctionPath) {
    const declSource = declarationSource(path);
    return true;
  }
  return false;
};

const canBeObservable = (
  path: t.NodePath<t.VariableDeclarator | t.ObjectProperty | t.Property>
) => {
  if (isComponentProperty(path)) {
    return false;
  }
  const node = t.isVariableDeclarator(path.node)
    ? path.node.init
    : path.node.value;
  return (
    t.isObjectExpression(node) === false &&
    t.isTaggedTemplateExpression(node) === false &&
    t.isArrowFunctionExpression(node) === false &&
    t.isFunctionExpression(node) === false &&
    isFidanCall(node) === false &&
    pathInTheComputedFn(path) === false &&
    t.isVariableDeclarator(path.node) && // const { value } = props
    t.isObjectPattern(path.node.id) === false
  );
};

const isComponentPropParameterPath = (path: t.NodePath<any>) => {
  const parentPath = parentComponentPath(path);
  if (!parentPath) {
    return false;
  }
  let params: any[] = null;
  if (t.isVariableDeclarator(parentPath.node)) {
    if (
      t.isArrowFunctionExpression(parentPath.node.init) ||
      t.isFunctionExpression(parentPath.node.init)
    ) {
      params = parentPath.node.init.params;
    }
  } else if (t.isFunctionDeclaration(parentPath.node)) {
    params = parentPath.node.params;
  }
  return (
    params.length === 1 &&
    t.isIdentifier(params[0]) &&
    params[0].name === path.node.init.name
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
  isComponentPropParameterPath,
};
