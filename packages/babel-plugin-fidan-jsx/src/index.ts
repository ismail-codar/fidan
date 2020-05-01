const fileExtentions = [ '.js', '.jsx', '.ts', '.tsx' ];
export const globalOptions = {
	moduleName: '_r$',
	delegateEvents: true,
	isTest: false,
	babelConfig: (pluginPath: string) => ({
		plugins: [
			pluginPath
				? [
						pluginPath,
						{
							moduleName: '_r$',
							isTest: true,
							exclude: [ '**/*.react*' ]
						}
					]
				: null,
			'@babel/plugin-syntax-dynamic-import',
			[ '@babel/plugin-proposal-decorators', { legacy: true } ],
			[ '@babel/plugin-proposal-class-properties', { loose: true } ],
			'@babel/plugin-syntax-jsx'
		].filter((p) => p != null),
		presets: [ '@babel/preset-typescript' ]
	}),
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
	return {};
};
