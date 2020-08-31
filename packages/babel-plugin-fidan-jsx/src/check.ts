import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from './common';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isPathDynamic = (path: NodePath<t.Node>, bindingName?: string) => {
	if (bindingName) {
		return globalData.dynamicPaths.includes(path.scope.bindings[bindingName].path);
	} else {
		return globalData.dynamicPaths.includes(path);
	}
};

export default {
	isFidanCall,
	isPathDynamic
};
