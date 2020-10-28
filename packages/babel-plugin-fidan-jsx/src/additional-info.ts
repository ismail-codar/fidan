import * as t from '@babel/types';
import check from './check';

const createCheck = (path: t.NodePath<t.Node>) => {
	if (!path.additionalInfo) {
		path.additionalInfo = {
			objectVariableDeclarationDynamicMemberExpressions: [],
			arrayVariableDeclarationMaps: [],
			callExpressionDeclarationDynamicParams: []
		};
	}
};

export default {
	createCheck
};
