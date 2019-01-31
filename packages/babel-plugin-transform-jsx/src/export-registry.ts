import * as fs from 'fs';
import * as path from 'path';
import * as babel from '@babel/core';
import * as t from '@babel/types';
import { NodePath } from 'babel-traverse';
import { found } from './found';

const fileExtentions = [ '.js', '.ts', '.tsx' ];
const registryData: { [key: string]: { fileName: string; nodes: t.BaseNode[] } } = {};

const babelConfig = {
	presets: [ '@babel/preset-typescript', '@babel/preset-react', '@babel/preset-env' ],
	plugins: []
};

function buildBabelConfig(plugin) {
	return Object.assign({}, babelConfig, {
		plugins: [ plugin ].concat(babelConfig.plugins)
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
			const variableBindings = found.variableBindingInScope(parentPath.scope, parentPath.node.right.name);
			return [ variableBindings.path.node ];
		}
	}
};

const getExportPaths = (fileName: string): t.BaseNode[] => {
	const localExports = [];
	if (fs.existsSync(fileName)) {
		babel.transformFileSync(
			fileName,
			buildBabelConfig(() => {
				return {
					visitor: {
						ExportNamedDeclaration(p) {
							localExports.push.apply(localExports, getDeclationsFromNamedExport(p.node));
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

const getDeclationsFromNamedExport = (node: t.ExportNamedDeclaration) => {
	if (t.isFunctionDeclaration(node.declaration)) return [ node.declaration ];
	else if (t.isVariableDeclaration(node.declaration)) return node.declaration.declarations;
	else if (t.isTypeAlias(node.declaration)) return [ node.declaration ];
	else return [];
};

const loadImportedFileExports = (fileName: string, importedFile: string) => {
	if (registryData[fileName]) return registryData[fileName];
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

export const exportRegistry = {
	loadImportedFileExports
};
