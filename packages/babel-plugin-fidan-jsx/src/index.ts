/// <reference path="../typings/babel.d.ts" />
import * as t from '@babel/types';
import * as fs from 'fs';
import anymatch from 'anymatch';
import jsx from '@babel/plugin-syntax-jsx';
import jsxToTemplateLiteral from './jsx-to-template-literal';
import modify from './modify';
import check from './check';
// import { stringify } from 'flatted';
// import * as fs from 'fs';
import generate from '@babel/generator';
import { globalData } from './common';

const bundlerSpecificFunctions = [
  //parcel
  '_templateObject*',
  '_taggedTemplateLiteral',
  //
];

export default (babel: any, options: any) => {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter(
          path: t.NodePath<t.Program>,
          state: { key; filename: string; file; opts: any }
        ) {
          const pluginOptions: typeof globalData.defaultPluginOptions = Object.assign(
            globalData.defaultPluginOptions,
            options
          );
          if (
            (pluginOptions.include &&
              anymatch(pluginOptions.include, state.filename) === false) ||
            (pluginOptions.exclude &&
              anymatch(pluginOptions.exclude, state.filename) === true)
          ) {
            path.stop();
            return;
          }

          // JSON.stringify(JSON.parse(stringify(path.node)), null, 1);
          // fs.writeFileSync(
          // 	state.filename.substr(0, state.filename.length - 4) + '.json',
          // 	JSON.stringify(JSON.parse(stringify(path.node)), null, 1)
          // );
          // debugger;
          modify.insertFidanImport(path.node.body);
          path.traverse(jsxToTemplateLiteral(babel).visitor, state);
          if (pluginOptions.automaticObserve === false) {
            path.stop();
            return;
          }
          if (
            process.env['IS_TEST'] &&
            (state.filename.endsWith('.jsx') || state.filename.endsWith('.tsx'))
          ) {
            fs.writeFileSync(
              state.filename.substr(0, state.filename.length - 3) + 'html.js',
              generate(path.node as any).code
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
            // console.log(generate(path.node as any).code);
            // debugger;
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
            } else if (check.isComponentPropertyPath(path) === false) {
              if (check.canBeObservable(path)) {
                path.node.init = modify.fidanObservableInit(path.node.init);
              } else {
                path.node.init = modify.fidanValAccess(path.node.init);
              }
            }
          }
        }
      },
      Property(path: t.NodePath<t.Property>) {
        if (check.canBeObservable(path)) {
          path.node.value = modify.fidanObservableInit(path.node.value);
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
      // ReturnStatement(path: t.NodePath<t.ReturnStatement>) {
      //   if (t.isUnaryExpression(path.node.argument)) {
      //     path.node.argument = modify.fidanUnary(path.node.argument);
      //   }
      // },
      IfStatement(path: t.NodePath<t.IfStatement>) {
        path.node.test = modify.fidanBinary(path.node.test);
      },
      ConditionalExpression(path: t.NodePath<t.ConditionalExpression>) {
        path.node.test = modify.fidanBinary(path.node.test);
        path.node.consequent = modify.fidanBinary(path.node.consequent);
        path.node.alternate = modify.fidanBinary(path.node.alternate);
      },
      ArrowFunctionExpression(path: t.NodePath<t.ArrowFunctionExpression>) {
        if (t.isExpression(path.node.body)) {
          path.node.body = modify.fidanBinary(path.node.body);
        }
      },
      ReturnStatement(path: t.NodePath<t.ReturnStatement>) {
        if (
          t.isExpression(path.node.argument) &&
          !t.isIdentifier(path.node.argument)
        ) {
          path.node.argument = modify.fidanBinary(path.node.argument);
        }
      },
      FunctionDeclaration(path: t.NodePath<t.FunctionDeclaration>) {
        if (anymatch(bundlerSpecificFunctions, path.node.id.name)) {
          path.stop();
        }
      },
    },
  };
};

const errorReport = (e: Error, path: t.NodePath<any>, file) => {
  const nodeCode = generate(path.node).code;
  console.log('FILE: ', file.filename);
  console.log('PART: ', nodeCode);
  console.error('ERROR: ', e);
  debugger;
};
