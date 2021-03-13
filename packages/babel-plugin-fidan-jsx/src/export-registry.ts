import * as fs from 'fs';
import * as path from 'path';
import * as babel from '@babel/core';
import * as t from '@babel/types';
import { globalData } from './common';

const registryData: {
  [key: string]: { fileName: string; nodePaths: t.NodePath[] };
} = {};

function buildBabelConfig(plugin) {
  const config = globalData.babelConfig('./index.ts');
  return Object.assign({}, config, {
    plugins: [plugin].concat(config.plugins),
  });
}

const getDeclationsFromExports = (path: t.NodePath<t.Identifier>) => {
  let parentPath: t.NodePath<any> = path.parentPath;
  while (!t.isAssignmentExpression(parentPath.node)) {
    parentPath = parentPath.parentPath;
    if (!parentPath) {
      return [];
    }
  }
  if (t.isAssignmentExpression(parentPath.node)) {
    if (t.isIdentifier(parentPath.node.right)) {
      const variableBindings = variableBindingInScope(
        parentPath.scope,
        parentPath.node.right.name
      );
      return [variableBindings.path.node];
    }
  }
};

const getExportPaths = (fileName: string): t.NodePath[] => {
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
            Identifier(path: t.NodePath<t.Identifier>, file) {
              if (path.node.name === 'exports') {
                if (t.isMemberExpression(path.parent)) {
                  localExports.push.apply(
                    localExports,
                    getDeclationsFromExports(path)
                  );
                }
              }
            },
          },
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

const loadImportedFileExports = (
  fileName: string,
  importedFile: string
): {
  fileName: string;
  nodePaths: t.NodePath[];
} => {
  if (
    importedFile.startsWith('.') === false &&
    importedFile.startsWith('/') == false &&
    importedFile.startsWith('~/') == false
  ) {
    return { fileName, nodePaths: [] };
  }
  if (registryData[fileName]) return registryData[fileName];
  else {
    importedFile = path.resolve(path.dirname(fileName), importedFile);
    globalData.fileExtentions.forEach(ext => {
      if (fs.existsSync(importedFile + ext)) {
        importedFile += ext;
      }
    });
    registryData[fileName] = {
      fileName: importedFile,
      nodePaths: getExportPaths(importedFile), // TODO return path
    };
    return registryData[fileName];
  }
};

export const variableBindingInScope = (
  scope: t.Scope,
  searchName: string
): t.Binding => {
  while (scope != null && searchName) {
    if (scope.bindings[searchName]) {
      return scope.bindings[searchName];
    }
    scope = scope.parent;
  }
  return null;
};

// export const declarationPathInScope = (
//   scope: t.Scope,
//   searchName: string
// ): t.NodePath => {
//   const variableBinding = variableBindingInScope(scope, searchName);
//   if (!variableBinding) return null;
//   if (t.isVariableDeclarator(variableBinding.path.node)) {
//     return variableBinding.path;
//   } else if (
//     t.isImportSpecifier(variableBinding.path.node) ||
//     t.isImportDefaultSpecifier(variableBinding.path.node)
//   ) {
//     debugger;
//     const exported = loadImportedFileExports(
//       globalData.currentFile.path,
//       variableBinding.path.parent['source'].value
//     );
//     return exported.nodePaths.find(node => {
//       if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
//         return node.id.name === searchName;
//       } else {
//         debugger;
//       }
//       return false;
//     });
//   }
// };
