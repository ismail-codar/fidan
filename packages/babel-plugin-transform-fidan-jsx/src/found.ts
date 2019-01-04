import * as t from "@babel/types";
import { NodePath, Scope, Binding } from "babel-traverse";
import generate from "babel-generator";
import { exportRegistry } from "./export-registry";

const callExpressionFirstMember = (
  expression: t.CallExpression
): t.Identifier => {
  if (t.isIdentifier(expression.callee)) return expression.callee;
  else if (t.isMemberExpression(expression.callee)) {
    return memberExpressionFirstMember(expression.callee);
  }
};

const memberExpressionFirstMember = (expression: t.MemberExpression) => {
  var member = expression;
  while (true) {
    if (t.isIdentifier(member.object)) return member.object;
    else if (t.isMemberExpression(member.object)) member = member.object;
    else if (t.isCallExpression(member.object))
      return callExpressionFirstMember(member.object);
    else if (t.isMemberExpression(member)) return member.property;
  }
};

const parentPathFound = <T>(
  path: NodePath<any>,
  check: (path: NodePath<t.BaseNode>) => boolean
): NodePath<T> => {
  while (path && !check(path)) path = path.parentPath;
  return path;
};

const variableBindingInScope = (scope: Scope, searchName: string): Binding => {
  while (scope != null && searchName) {
    for (var bindingKey in scope.bindings) {
      if (bindingKey == searchName) {
        return scope.bindings[bindingKey];
      }
    }
    scope = scope.parent;
  }
  return null;
};

const callingMethodParamsInNode = (callee, node: t.BaseNode): t.BaseNode[] => {
  var foundParams = [];
  if (t.isVariableDeclarator(node)) {
    if (t.isFunctionExpression(node.init)) {
      foundParams = node.init.params;
    } else if (t.isObjectExpression(node.init)) {
      //call-6
      if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
        node.init.properties.every(prop => {
          if (
            t.isObjectProperty(prop) &&
            t.isIdentifier(prop.key) &&
            prop.key.name === callee.property.name &&
            t.isFunctionExpression(prop.value)
          ) {
            foundParams = prop.value.params;
            return false;
          } else return true;
        });
      } else throw "not implemented in callingMethodParams";
    }
  }
  return foundParams;
};

const callingMethodParams = (
  path: NodePath<t.CallExpression>,
  filename: string
): t.LVal[] => {
  var foundParams = null;
  const callee = path.node.callee;
  const searchName = t.isIdentifier(callee)
    ? callee.name
    : t.isMemberExpression(callee) && t.isIdentifier(callee.object)
      ? callee.object.name
      : null;
  if (searchName) {
    const foundPath = parentPathFound(path, checkPath => {
      const variableBinding = checkPath.scope.bindings[searchName];
      if (variableBinding) {
        if (t.isVariableDeclarator(variableBinding.path.node)) {
          foundParams = callingMethodParamsInNode(
            callee,
            variableBinding.path.node
          );
          if (foundParams) return true;
        } else if (t.isImportSpecifier(variableBinding.path.node)) {
          const exportedNodes = exportRegistry.loadImportedFileExports(
            filename,
            variableBinding.path.parent["source"].value
          );
          exportedNodes.find(node => {
            foundParams = callingMethodParamsInNode(callee, node);
            return foundParams !== null;
          });
          if (foundParams) return true;
          return true;
        }
      }
    });
  }
  return foundParams;
};

const findContextChildIndex = (args: any[]) => {
  return args.findIndex(arg => {
    if (
      t.isCallExpression(arg) &&
      arg.arguments.length &&
      t.isMemberExpression(arg.arguments[0])
    ) {
      const memberExpression = arg.arguments[0] as t.MemberExpression;
      if (
        t.isIdentifier(memberExpression.property) &&
        memberExpression.property.name == "Context"
      ) {
        return true;
      } else return false;
    } else return false;
  });
};

export const pathElementTagName = (
  path: NodePath<t.JSXExpressionContainer>
) => {
  if (
    t.isJSXOpeningElement(path.parentPath.parentPath.node) &&
    t.isJSXIdentifier(path.parentPath.parentPath.node.name)
  )
    return path.parentPath.parentPath.node.name.name;
  return null;
};

export const found = {
  callExpressionFirstMember,
  memberExpressionFirstMember,
  parentPathFound,
  variableBindingInScope,
  callingMethodParams,
  findContextChildIndex,
  pathElementTagName
};
