const transform = require('@fidanjs/babel-plugin-fidan-jsx');

module.exports = function(context, options = {}) {
  const plugins = [[transform, options]];

  return {
    plugins,
  };
};
