import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';

export default (babel) => {
	return {
		visitor: {
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				debugger;
			}
		}
	};
};
