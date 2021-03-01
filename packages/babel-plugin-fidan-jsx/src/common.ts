const fileExtentions = ['.view.js', '.jsx', '.view.ts', '.tsx'];
export const globalData = {
  moduleName: '_r$',
  delegateEvents: true,
  isTest: false,
  fileExtentions: fileExtentions,
  currentFile: {
    path: '',
  },
  defaultPluginOptions: {
    include: fileExtentions.map(ext => '**/*' + ext),
  },
  openedTags: [],
  isSvg: false,
  isInTaggedTemplateExpression: false,
};
