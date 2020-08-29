import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import modifiy from './modifiy';

const fileExtentions = [ '.js', '.jsx', '.ts', '.tsx' ];
export const globalOptions = {
	moduleName: '_r$',
	delegateEvents: true,
	isTest: false,
	fileExtentions: fileExtentions,
	currentFile: {
		path: ''
	},
	defaultPluginOptions: {
		include: fileExtentions.map((ext) => '**/*' + ext)
	},
	openedTags: [],
	isSvg: false
};

export default (babel) => {
	return {
		inherits: jsx,
		visitor: {
			Program: (path: NodePath<t.Program>, state: { key; filename; file }) => {
				path.traverse(jsxToTemplateLiteral(babel).visitor, state);
			},
			TaggedTemplateExpression: (path: NodePath<t.TaggedTemplateExpression>, state: { key; filename; file }) => {
				path.node.quasi.expressions.forEach((exp) => {
					if (t.isIdentifier(exp)) {
						const binding = path.scope.bindings[exp.name];
						const bindingPathNode = binding.path.node;
						if (t.isVariableDeclarator(bindingPathNode)) {
							bindingPathNode.init = modifiy.fidanValueInit(bindingPathNode.init);
						} else {
							debugger;
						}
						binding.referencePaths.filter((item) => item !== path).forEach((referencePath: NodePath) => {
							referencePath.node = modifiy.memberVal(referencePath.node);
						});
					} else if (t.isBinaryExpression(exp)) {
						debugger;
					} else if (t.isCallExpression(exp)) {
						debugger;
					} else {
						debugger;
					}
				});
			}
		}
	};
};
