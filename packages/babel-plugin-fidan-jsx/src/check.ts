import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from './common';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isNodeDynamic = (name: string) => {
	return globalData.dynamicPaths.find((tpath: NodePath<t.TaggedTemplateExpression>) => {
		return tpath.node.quasi.expressions.find((expr) => {
			if (t.isIdentifier(expr)) {
				if (name === expr.name) {
					return true;
				} else {
					console.log(tpath);
					// c dinamiktir
					// TODO c  nin deklaration ı callExpression ise argumanlarında da name var ise return true
					debugger;
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
