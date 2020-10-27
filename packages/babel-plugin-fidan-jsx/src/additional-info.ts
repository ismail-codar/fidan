import * as t from '@babel/types';
import check from './check';

const create = (path: t.NodePath<t.Node>) => {
	if (!path.additionalInfo) {
		path.additionalInfo = {
			memberExpressions: [],
			arrayMapItems: []
		};
	}
};

// which members are dynamic on dynamic object variable ->  object-property-1
export const addDynamicMemberToObject = (path: t.NodePath<t.Node>, info: t.MemberExpression) => {
	const parentFunctionExpressionPath = check.parentPathLoop(
		path,
		(checkPath) => t.isArrowFunctionExpression(checkPath.node) || t.isFunctionExpression(checkPath.node)
	);
	if (
		parentFunctionExpressionPath &&
		t.isCallExpression(parentFunctionExpressionPath.parentPath.node) &&
		t.isMemberExpression(parentFunctionExpressionPath.parentPath.node.callee) &&
		t.isIdentifier(parentFunctionExpressionPath.parentPath.node.callee.property) &&
		t.isIdentifier(parentFunctionExpressionPath.parentPath.node.callee.object) &&
		parentFunctionExpressionPath.parentPath.node.callee.property.name === 'map'
	) {
		const parentObjectBinding =
			parentFunctionExpressionPath.parentPath.scope.bindings[
				parentFunctionExpressionPath.parentPath.node.callee.object.name
			];
		if (
			t.isVariableDeclarator(parentObjectBinding.path.node) &&
			t.isArrayExpression(parentObjectBinding.path.node.init)
		) {
			const arrayVariableDeclaratorPath = parentObjectBinding.path as t.NodePath<t.VariableDeclarator>;
			//TEST: todolist
			arrayVariableDeclaratorPath.additionalInfo.arrayMapItems.push(path);
			path.additionalInfo.parentArrayPath = arrayVariableDeclaratorPath;
		}
	}
	//TEST: object-property-1
	path.additionalInfo.memberExpressions.push(info);
};

export default {
	addDynamicMemberToObject,
	create
};
