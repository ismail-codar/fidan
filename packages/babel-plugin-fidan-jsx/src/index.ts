/// <reference path="../typings/babel.d.ts" />
import * as t from '@babel/types';
import * as fs from 'fs';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import modify from './modify';
import check from './check';
// import { stringify } from 'flatted';
// import * as fs from 'fs';
import generate from '@babel/generator';

// https://github.com/ismail-codar/fidan/tree/58ed3b07faeb93fb3da18b3f8bb570462c96f48e/packages/babel-plugin-fidan-jsx

export default (babel: any, options: any) => {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter(
          path: t.NodePath<t.Program>,
          state: { key; filename: string; file }
        ) {
          // JSON.stringify(JSON.parse(stringify(path.node)), null, 1);
          // fs.writeFileSync(
          // 	state.filename.substr(0, state.filename.length - 4) + '.json',
          // 	JSON.stringify(JSON.parse(stringify(path.node)), null, 1)
          // );
          // debugger;
          modify.insertFidanImport(path.node.body);
          path.traverse(jsxToTemplateLiteral(babel).visitor, state);
          if (
            process.env['IS_TEST'] &&
            (state.filename.endsWith('.jsx') || state.filename.endsWith('.tsx'))
          ) {
            fs.writeFileSync(
              state.filename.substr(0, state.filename.length - 3) + 'html.js',
              generate(path.node).code
            );
          }
        },
        // exit(path: t.NodePath<t.Program>, state: { key; filename; file }) {
        // 	debugger;
        // 	console.log(generate(path.node).code);
        // }
      },
      VariableDeclarator(path: t.NodePath<t.VariableDeclarator>) {
        // console.log(path);
        if (check.isRequiredComputedExpression(path)) {
          path.node.init = modify.fidanComputedExpressionInit(path.node.init);
        } else {
          if (
            t.isFunctionExpression(path.node.init) === false &&
            t.isArrowFunctionExpression(path.node.init) === false &&
            t.isObjectPattern(path.node.id) === false // counter -> const { value } = props;
          ) {
            path.node.init = modify.fidanValueInit(path.node.init);
          }
        }
      },
      ObjectProperty(path: t.NodePath<t.ObjectProperty>) {
        if (t.isLiteral(path.node.value)) {
          path.node.value = modify.fidanValueInit(path.node.value);
        }
      },
      ExpressionStatement(path: t.NodePath<t.ExpressionStatement>) {
        if (t.isAssignmentExpression(path.node.expression)) {
          console.log(generate(path.node).code);
          path.node.expression = modify.fidanValueSet(path.node.expression);
          console.log(generate(path.node).code);
        } else if (t.isUpdateExpression(path.node.expression)) {
          path.node.expression = modify.fidanValueSet(
            t.assignmentExpression(
              '=',
              path.node.expression.argument as t.LVal,
              t.binaryExpression(
                path.node.expression.operator.substr(0, 1) as any,
                path.node.expression.argument,
                t.numericLiteral(1)
              )
            )
          );
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
        // if (
        //   t.isIdentifier(path.node.left) ||
        //   t.isMemberExpression(path.node.left)
        // ) {
        //   path.node.left = modify.fidanValAccess(path.node.left);
        // } else {
        //   check.unknownState(path);
        // }
        // if (
        //   t.isIdentifier(path.node.right) ||
        //   t.isMemberExpression(path.node.right)
        // ) {
        //   path.node.right = modify.fidanValAccess(path.node.right);
        // } else {
        //   check.unknownState(path);
        // }
      },
    },
  };
};
