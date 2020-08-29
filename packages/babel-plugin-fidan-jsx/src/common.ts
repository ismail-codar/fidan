import * as t from 'babel-types';
import { NodePath } from 'babel-traverse';

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
	isSvg: false,
	templateLiteralExpressionPaths: [] as NodePath<t.Node>[]
};
