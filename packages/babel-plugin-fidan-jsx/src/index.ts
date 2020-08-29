import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import templateLiteralVariables from './template-literal-variables';
import modifiy from './modifiy';
import { globalOptions } from './common';

export default (babel) => {
	const templateLiteralExpressionPaths = globalOptions.templateLiteralExpressionPaths;

	return {
		inherits: jsx,
		visitor: {
			Program(path: NodePath<t.Program>, state: { key; filename; file }) {
				path.traverse(jsxToTemplateLiteral(babel).visitor, state);
				path.traverse(templateLiteralVariables(babel).visitor, state);
			},
			VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
				templateLiteralExpressionPaths.forEach((tpath: NodePath<t.TaggedTemplateExpression>) => {
					tpath.node.quasi.expressions.forEach((expr) => {
						if (t.isIdentifier(path.node.id) && t.isIdentifier(expr)) {
							if (path.node.id.name === expr.name) {
								path.node.init = modifiy.fidanValueInit(path.node.init);
							}
						} else {
							debugger;
						}
					});
				});
			},
			CallExpression(path: NodePath<t.CallExpression>) {
				path.node.arguments.forEach((arg, index) => {
					if (t.isIdentifier(arg)) {
						path.node.arguments[index] = modifiy.fidanValAccess(arg);
					} else {
						debugger;
					}
				});
			}
		}
	};
};
