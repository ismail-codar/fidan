/// <reference path="../typings/babel.d.ts" />
import * as t from '@babel/types';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import modify from './modify';
import check from './check';
// import { stringify } from 'flatted';
// import * as fs from 'fs';
// import generate from '@babel/generator';

export default (babel: any) => {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter(path: t.NodePath<t.Program>, state: { key; filename; file }) {
          // JSON.stringify(JSON.parse(stringify(path.node)), null, 1);
          // fs.writeFileSync(
          // 	state.filename.substr(0, state.filename.length - 4) + '.json',
          // 	JSON.stringify(JSON.parse(stringify(path.node)), null, 1)
          // );
          // debugger;
          modify.insertFidanImport(path.node.body);
          path.traverse(jsxToTemplateLiteral(babel).visitor, state);
          // console.log(generate(path.node).code);
        },
        // exit(path: t.NodePath<t.Program>, state: { key; filename; file }) {
        // 	debugger;
        // 	console.log(generate(path.node).code);
        // }
      },
      VariableDeclarator(path: t.NodePath<t.VariableDeclarator>) {
        console.log(path);
      },
      ObjectProperty(path: t.NodePath<t.ObjectProperty>) {
        console.log(path);
      },
      ExpressionStatement(path: t.NodePath<t.ExpressionStatement>) {
        if (t.isAssignmentExpression(path.node.expression)) {
        } else if (t.isUpdateExpression(path.node.expression)) {
        }
      },
      // TaggedTemplateExpression(path: t.NodePath<t.TaggedTemplateExpression>) {
      // path.node.quasi.expressions.forEach((expr, index) => {});
      // },
      //  #region Identity a -> a()
      CallExpression(path: t.NodePath<t.CallExpression>) {
        path.node.arguments.forEach((arg, index) => {
          if (t.isIdentifier(arg)) {
            path.node.arguments[index] = modify.fidanValAccess(arg);
          }
        });
      },
      BinaryExpression(path: t.NodePath<t.BinaryExpression>) {
        if (
          t.isIdentifier(path.node.left) ||
          t.isMemberExpression(path.node.left)
        ) {
          path.node.left = modify.fidanValAccess(path.node.left);
        } else {
          check.unknownState(path);
        }
        if (
          t.isIdentifier(path.node.right) ||
          t.isMemberExpression(path.node.right)
        ) {
          path.node.right = modify.fidanValAccess(path.node.right);
        } else {
          check.unknownState(path);
        }
      },
    },
  };
};
