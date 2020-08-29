import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import { globalOptions } from '../common';

export default (babel) => {
	const templateLiteralExpressionPaths = globalOptions.templateLiteralExpressionPaths;
	return {
		visitor: {
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				templateLiteralExpressionPaths.push(path);
			}
		}
	};
};
