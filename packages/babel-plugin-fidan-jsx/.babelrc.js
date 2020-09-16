module.exports = {
	presets: [],
	plugins: [
		[
			process.env.IS_TEST ? './src/index.ts' : './build/index.js',
			{
				lowercaseEventNames: true,
				eventNamesPrefix: 'on-'
			}
		]
	]
};
