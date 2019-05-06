import * as fs from "fs";
import * as path from "path";
import * as babel from "@babel/core";
import * as t from "@babel/types";
import { NodePath, Scope, Binding } from "babel-traverse";
import { globalOptions } from ".";

const registryData: {
  [key: string]: { fileName: string; nodes: any[] };
} = {};

function buildBabelConfig(plugin) {
  const config = globalOptions.babelConfig(null);
  return Object.assign({}, config, {
    plugins: [plugin].concat(config.plugins)
  });
}

const getDeclationsFromExports = (path: NodePath<t.Identifier>) => {
  let parentPath: NodePath<any> = path.parentPath;
  while (!t.isAssignmentExpression(parentPath.node)) {
    parentPath = parentPath.parentPath;
    if (!parentPath) {
      return [];
    }
  }
  if (t.isAssignmentExpression(parentPath.node)) {
    debugger;
    if (t.isIdentifier(parentPath.node.right)) {
      const variableBindings = variableBindingInScope(
        parentPath.scope,
        parentPath.node.right.name
      );
      return [variableBindings.path.node];
    }
  }
};

const getExportPaths = (fileName: string): any[] => {
  const localExports: any[] = [];
  if (fs.existsSync(fileName)) {
    babel.transformFileSync(
      fileName,
      buildBabelConfig(() => {
        return {
          visitor: {
            ExportNamedDeclaration(p) {
              localExports.push.apply(
                localExports,
                getDeclationsFromNamedExport(p.node)
              );
            },
            Identifier(path: NodePath<t.Identifier>, file) {
              const parentNode = path.parent;
              if (path.node.name === "exports") {
                if (t.isMemberExpression(path.parent)) {
                  localExports.push.apply(
                    localExports,
                    getDeclationsFromExports(path)
                  );
                }
              }
            }
          }
        };
      })
    );
  }
  return localExports;
};

const getDeclationsFromNamedExport = (node: t.ExportNamedDeclaration) => {
  if (t.isFunctionDeclaration(node.declaration)) return [node.declaration];
  else if (t.isVariableDeclaration(node.declaration))
    return node.declaration.declarations;
  else if (t.isTypeAlias(node.declaration)) return [node.declaration];
  else return [];
};

const loadImportedFileExports = (fileName: string, importedFile: string) => {
  if (
    importedFile.startsWith(".") === false &&
    importedFile.startsWith("/") == false &&
    importedFile.startsWith("~/") == false
  ) {
    return { nodes: [] };
  }
  if (registryData[fileName]) return registryData[fileName];
  else {
    importedFile = path.resolve(path.dirname(fileName), importedFile);
    globalOptions.fileExtentions.forEach(ext => {
      if (fs.existsSync(importedFile + ext)) {
        importedFile += ext;
      }
    });
    registryData[fileName] = {
      fileName: importedFile,
      nodes: getExportPaths(importedFile)
    };
    return registryData[fileName];
  }
};

export const variableBindingInScope = (
  scope: Scope,
  searchName: string
): Binding => {
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

export const declarationInScope = (scope: Scope, searchName: string) => {
  const variableBinding = variableBindingInScope(scope, searchName);
  if (t.isVariableDeclarator(variableBinding.path.node)) {
    return variableBinding.path.node;
  } else if (
    t.isImportSpecifier(variableBinding.path.node) ||
    t.isImportDefaultSpecifier(variableBinding.path.node)
  ) {
    const exported = loadImportedFileExports(
      globalOptions.currentFile.path,
      variableBinding.path.parent["source"].value
    );
    debugger;
    return exported.nodes.find(node => {
      if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
        return node.id.name === searchName;
      } else {
        debugger;
      }
      return false;
    });
  }
};
