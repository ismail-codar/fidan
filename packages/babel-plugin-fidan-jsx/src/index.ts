import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';
import jsxToTemplateLiteral from './jsx-to-template-literal';

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
		inherits: jsxToTemplateLiteral,
		visitor: {
			Program: (path: NodePath<t.Program>, state: { key; filename; file }) => {}
		}
	};
};
