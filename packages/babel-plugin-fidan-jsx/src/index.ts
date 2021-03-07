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
        if (check.isFidanCall(path.node.init) === false) {
          if (
            t.isCallExpression(path.node.init) &&
            path.node.init.arguments.length === 0 &&
            (t.isArrowFunctionExpression(path.node.init.callee) ||
              t.isFunctionExpression(path.node.init.callee))
          ) {
            // const shownTodos = (() => {return ...})
            path.node.init = modify.fidanComputedFunction(
              path.node.init.callee
            );
          } else if (check.isRequiredComputedExpression(path)) {
            path.node.init = modify.fidanComputedExpressionInit(path.node.init);
          } else {
            if (
              t.isFunctionExpression(path.node.init) ||
              t.isArrowFunctionExpression(path.node.init)
            ) {
              if (
                t.isFunctionExpression(path.node.init.body) ||
                t.isArrowFunctionExpression(path.node.init.body)
              ) {
                // const footerLinkCss = waiting => () => hashFilter === waiting ? 'selected' : '';
                path.node.init.body = modify.fidanComputedFunction(
                  path.node.init.body
                );
              }
            } else if (t.isObjectPattern(path.node.id) === false) {
              // counter -> const { value } = props;)
              path.node.init = modify.fidanValueInit(path.node.init);
            }
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
          path.node.expression.right = modify.fidanValueAssign(
            path.node.expression
          );
        } else if (t.isUpdateExpression(path.node.expression)) {
          path.node.expression = modify.fidanValueAssign(
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
        } else if (t.isLogicalExpression(path.node.expression)) {
          path.node.expression = modify.fidanBinary(path.node.expression);
        }
      },
      CallExpression(path: t.NodePath<t.CallExpression>) {
        if (check.isFidanCall(path.node) === false) {
          path.node.arguments.forEach((arg, index) => {
            path.node.arguments[index] = modify.fidanValAccess(arg);
          });
        }
      },
      ReturnStatement(path: t.NodePath<t.ReturnStatement>) {
        if (t.isUnaryExpression(path.node.argument)) {
          path.node.argument = modify.fidanUnary(path.node.argument);
        }
      },
      IfStatement(path: t.NodePath<t.IfStatement>) {
        path.node.test = modify.fidanBinary(path.node.test);
      },
      ConditionalExpression(path: t.NodePath<t.ConditionalExpression>) {
        path.node.test = modify.fidanBinary(path.node.test);
      },
      ArrowFunctionExpression(path: t.NodePath<t.ArrowFunctionExpression>) {
        if (t.isExpression(path.node.body)) {
          path.node.body = modify.fidanBinary(path.node.body);
        }
      },
    },
  };
};
