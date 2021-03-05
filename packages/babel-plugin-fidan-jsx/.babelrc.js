module.exports = {
  presets: [],
  plugins: [
    [
      process.env.IS_TEST ? './src/index.ts' : './dist/index.js',
      {
        lowercaseEventNames: true,
        eventNamesPrefix: 'on',
      },
    ],
  ],
};
