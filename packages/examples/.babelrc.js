var domJsx = require('@fidan/babel-plugin-transform-fidan-jsx');
module.exports = {
	plugins: [
		domJsx,
		[
			'transform-react-jsx',
			{
				pragma: 'fidan'
			}
		]
	]
};
