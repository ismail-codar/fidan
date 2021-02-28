// https://github.com/ismail-codar/fidan/tree/58ed3b07faeb93fb3da18b3f8bb570462c96f48e/packages/babel-plugin-fidan-jsx/src

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
