import * as t from '@babel/types';
import { globalData } from './common';
import { declarationPathInScope } from './export-registry';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isComponentCall = (path: t.NodePath<t.TaggedTemplateExpression>, expr: t.CallExpression) => {
	// TODO check if calling function returns html
	return t.isIdentifier(expr.callee) && expr.callee.name[0] === expr.callee.name[0].toUpperCase();
};

const isPathDynamic = (path: t.NodePath<t.Node>, bindingName?: string) => {
	const dynamicPaths = globalData.dynamicPaths;
	if (bindingName) {
		const declPath = declarationPathInScope(path.scope, bindingName);
		return dynamicPaths.includes(declPath);
	} else {
		return dynamicPaths.includes(path);
	}
};

export default {
	isFidanCall,
	isComponentCall,
	isPathDynamic
};
