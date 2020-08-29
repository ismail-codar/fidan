import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalOptions } from './common';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isNodeDynamic = (name: string) => {
	return globalOptions.templateLiteralExpressionPaths.find((tpath: NodePath<t.TaggedTemplateExpression>) => {
		return tpath.node.quasi.expressions.find((expr) => {
			if (t.isIdentifier(expr)) {
				if (name === expr.name) {
					return true;
				}
			} else {
				debugger;
			}
		});
	});
};

export default {
	isFidanCall,
	isNodeDynamic
};
