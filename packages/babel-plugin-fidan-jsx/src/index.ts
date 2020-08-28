import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import taggedTemplateVariables from './tagged-template-variables';

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
				path.traverse(taggedTemplateVariables(babel).visitor, state);
				debugger;
			}
		}
	};
};
