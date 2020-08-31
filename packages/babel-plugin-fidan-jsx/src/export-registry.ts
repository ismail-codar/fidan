import * as fs from 'fs';
import * as path from 'path';
import * as babel from '@babel/core';
import * as t from '@babel/types';
import { NodePath, Scope, Binding } from 'babel-traverse';
import { globalData } from './common';

const registryData: {
	[key: string]: { fileName: string; paths: NodePath[] };
} = {};

function buildBabelConfig(plugin) {
	return {
		plugins: [ plugin ]
	};
}

const getDeclationsFromExports = (path: NodePath<t.Identifier>): NodePath[] => {
	let parentPath: NodePath<any> = path.parentPath;
	while (!t.isAssignmentExpression(parentPath.node)) {
		parentPath = parentPath.parentPath;
		if (!parentPath) {
			return [];
		}
	}
	if (t.isAssignmentExpression(parentPath.node)) {
		if (t.isIdentifier(parentPath.node.right)) {
			const variableBindings = variableBindingInScope(parentPath.scope, parentPath.node.right.name);
			return [ variableBindings.path ];
		}
	}
};

const getExportPaths = (fileName: string): NodePath[] => {
	const localExports: NodePath[] = [];
	if (fs.existsSync(fileName)) {
		babel.transformFileSync(
			fileName,
			buildBabelConfig(() => {
				return {
					visitor: {
						ExportNamedDeclaration(p) {
							debugger;
							// localExports.push.apply(localExports, getDeclationsFromNamedExport(p.node));
						},
						Identifier(path: NodePath<t.Identifier>, file) {
							const parentNode = path.parent;
							if (path.node.name === 'exports') {
								if (t.isMemberExpression(path.parent)) {
									localExports.push.apply(localExports, getDeclationsFromExports(path));
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

// const getDeclationsFromNamedExport = (node: t.ExportNamedDeclaration):NodePath[] => {
// 	if (t.isFunctionDeclaration(node.declaration)) return [ node.declaration ];
// 	else if (t.isVariableDeclaration(node.declaration)) return node.declaration.declarations;
// 	else if (t.isTypeAlias(node.declaration)) return [ node.declaration ];
// 	else return [];
// };

const loadImportedFileExports = (
	fileName: string,
	importedFile: string
): {
	fileName?: string;
	paths: NodePath[];
} => {
	if (
		importedFile.startsWith('.') === false &&
		importedFile.startsWith('/') == false &&
		importedFile.startsWith('~/') == false
	) {
		return { paths: [] };
	}
	if (registryData[fileName]) return registryData[fileName];
	else {
		importedFile = path.resolve(path.dirname(fileName), importedFile);
		globalData.fileExtentions.forEach((ext) => {
			if (fs.existsSync(importedFile + ext)) {
				importedFile += ext;
			}
		});
		registryData[fileName] = {
			fileName: importedFile,
			paths: getExportPaths(importedFile)
		};
		return registryData[fileName];
	}
};

export const variableBindingInScope = (scope: Scope, searchName: string): Binding => {
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

export const declarationPathInScope = (scope: Scope, searchName: string): NodePath => {
	const variableBinding = variableBindingInScope(scope, searchName);
	if (!variableBinding) return null;
	if (t.isVariableDeclarator(variableBinding.path.node)) {
		return variableBinding.path;
	} else if (
		t.isImportSpecifier(variableBinding.path.node) ||
		t.isImportDefaultSpecifier(variableBinding.path.node)
	) {
		const exported = loadImportedFileExports(
			globalData.currentFile.path,
			variableBinding.path.parent['source'].value
		);
		return exported.paths.find((node) => {
			if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
				return node.id.name === searchName;
			} else {
				debugger;
			}
			return null;
		});
	}
};
