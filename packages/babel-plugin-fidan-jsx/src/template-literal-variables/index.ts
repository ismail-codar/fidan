import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalData } from '../common';

export default (babel) => {
	const templateLiteralExpressionPaths = globalData.templateLiteralExpressionPaths;
	return {
		visitor: {
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				templateLiteralExpressionPaths.push(path);
			}
		}
	};
};
