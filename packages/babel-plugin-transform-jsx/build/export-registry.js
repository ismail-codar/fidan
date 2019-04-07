"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const t = require("@babel/types");
const found_1 = require("./found");
const fileExtentions = ['.js', '.ts', '.tsx'];
const registryData = {};
const babelConfig = {
    presets: ['@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env'],
    plugins: []
};
function buildBabelConfig(plugin) {
    return Object.assign({}, babelConfig, {
        plugins: [plugin].concat(babelConfig.plugins)
    });
}
const getDeclationsFromExports = (path) => {
    let parentPath = path.parentPath;
    while (!t.isAssignmentExpression(parentPath.node)) {
        parentPath = parentPath.parentPath;
        if (!parentPath) {
            return [];
        }
    }
    if (t.isAssignmentExpression(parentPath.node)) {
        debugger;
        if (t.isIdentifier(parentPath.node.right)) {
            const variableBindings = found_1.found.variableBindingInScope(parentPath.scope, parentPath.node.right.name);
            return [variableBindings.path.node];
        }
    }
};
const getExportPaths = (fileName) => {
    const localExports = [];
    if (fs.existsSync(fileName)) {
        babel.transformFileSync(fileName, buildBabelConfig(() => {
            return {
                visitor: {
                    ExportNamedDeclaration(p) {
                        localExports.push.apply(localExports, getDeclationsFromNamedExport(p.node));
                    },
                    Identifier(path, file) {
                        const parentNode = path.parent;
                        if (path.node.name === 'exports') {
                            if (t.isMemberExpression(path.parent)) {
                                localExports.push.apply(localExports, getDeclationsFromExports(path));
                            }
                        }
                    }
                }
            };
        }));
    }
    return localExports;
};
const getDeclationsFromNamedExport = (node) => {
    if (t.isFunctionDeclaration(node.declaration))
        return [node.declaration];
    else if (t.isVariableDeclaration(node.declaration))
        return node.declaration.declarations;
    else if (t.isTypeAlias(node.declaration))
        return [node.declaration];
    else
        return [];
};
const loadImportedFileExports = (fileName, importedFile) => {
    if (importedFile.startsWith('.') === false &&
        importedFile.startsWith('/') == false &&
        importedFile.startsWith('~/') == false) {
        return { nodes: [] };
    }
    if (registryData[fileName])
        return registryData[fileName];
    else {
        importedFile = path.resolve(path.dirname(fileName), importedFile);
        fileExtentions.forEach((ext) => {
            if (fs.existsSync(importedFile + ext)) {
                importedFile += ext;
            }
        });
        registryData[fileName] = { fileName: importedFile, nodes: getExportPaths(importedFile) };
        return registryData[fileName];
    }
};
exports.exportRegistry = {
    loadImportedFileExports
};
//# sourceMappingURL=export-registry.js.map