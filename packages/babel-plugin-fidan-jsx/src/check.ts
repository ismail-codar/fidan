import * as t from '@babel/types';
import generate from '@babel/generator';

const unknownState = (path: t.NodePath<t.Node>, data?: any) => {
  // debugger;
};

const isEmptyLiteral = (literal: t.TemplateLiteral) => {
  return literal.quasis.length == 1 && literal.quasis[0].value.raw === '';
};

export default {
  unknownState,
  isEmptyLiteral,
};
