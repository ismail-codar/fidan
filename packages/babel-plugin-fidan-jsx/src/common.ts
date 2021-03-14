export const globalData = {
  fileExtentions: [], // TODO fileExtentions
  currentFile: {
    path: '',
  },
  defaultPluginOptions: {
    lowercaseEventNames: true,
    eventNamesPrefix: 'on',
    automaticObserve: true,
    include: ['**/*.jsx', '**/*.tsx', '**/*.view.*'],
    exclude: ['**/*.react*'],
  },
  babelConfig: (pluginPath: string) => ({
    plugins: [
      [
        pluginPath,
        {
          lowercaseEventNames: true,
          eventNamesPrefix: 'on',
        },
      ],
    ],
  }),
};
