import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from './common';
import { declarationPathInScope } from './template-literal-variables/export-registry';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isPathDynamic = (path: NodePath<t.Node>, bindingName?: string) => {
	const dynamicPaths = globalData.dynamicPaths;
	if (bindingName) {
		const declPath = declarationPathInScope(path.scope, bindingName);
		return dynamicPaths.includes(declPath);
		// return dynamicPaths.includes(path.scope.bindings[bindingName].path);
	} else {
		return dynamicPaths.includes(path);
	}
};

export default {
	isFidanCall,
	isPathDynamic
};
