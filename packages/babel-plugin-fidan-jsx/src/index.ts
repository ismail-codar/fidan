// original: https://github.com/ryansolid/babel-plugin-jsx-dom-expressions/blob/master/src/index.js
import * as t from "@babel/types";
import * as anymatch from "anymatch";

import SyntaxJSX from "@babel/plugin-syntax-jsx";
import { generateHTMLNode } from "./generate";
import { createTemplate } from "./ast";
import { insertFidanImport } from "./util";
import { NodePath } from "babel-traverse";
import generate from "@babel/generator";

export const globalOptions = {
  moduleName: "_r$",
  delegateEvents: true,
  isTest: false
};
let doNotTraverse = false;

const errorReport = (e: Error, path: NodePath<any>, file) => {
  const nodeCode = generate(path.node).code;
  console.log("FILE: ", file.filename);
  console.log("PART: ", nodeCode);
  console.error("ERROR: ", e);
  debugger;
};

export default babel => {
  return {
    name: "ast-transform",
    inherits: SyntaxJSX,
    visitor: {
      JSXElement: (path, { opts }) => {
        if (doNotTraverse) return;
        if ("moduleName" in opts) globalOptions.moduleName = opts.moduleName;
        if ("delegateEvents" in opts)
          globalOptions.delegateEvents = opts.delegateEvents;
        const result = generateHTMLNode(path, path.node, opts);
        if (result.id) {
          createTemplate(path, result);
          if (!result.exprs.length && result.decl.declarations.length === 1)
            path.replaceWith(result.decl.declarations[0].init);
          else
            path.replaceWithMultiple(
              [result.decl].concat(
                result.exprs,
                t.expressionStatement(result.id)
              )
            );
        } else path.replaceWith(result.exprs[0]);
      },
      JSXFragment: (path, { opts }) => {
        try {
          if ("moduleName" in opts) globalOptions.moduleName = opts.moduleName;
          if ("delegateEvents" in opts)
            globalOptions.delegateEvents = opts.delegateEvents;
          const result = generateHTMLNode(path, path.node, opts);
          createTemplate(path, result, true);
          if (!result.exprs.length && result.decl.declarations.length === 1)
            path.replaceWith(result.decl.declarations[0].init);
          else
            path.replaceWithMultiple(
              [result.decl].concat(
                result.exprs,
                t.expressionStatement(result.id)
              )
            );
        } catch (e) {
          errorReport(e, path, this.file);
        }
      },
      Program: {
        enter(path) {
          globalOptions.isTest = false;
          if (this.opts.moduleName) {
            globalOptions.moduleName = this.opts.moduleName;
          }
          if (this.opts.isTest) {
            globalOptions.isTest = true;
          }

          if (!globalOptions.isTest) {
            const body: t.BaseNode[] = path.node.body;
            insertFidanImport(body);
          }

          doNotTraverse = false;
          // https://github.com/micromatch/anymatch#usage
          if (
            (this.opts.include &&
              anymatch(this.opts.include, this.file.opts.filename) === false) ||
            (this.opts.exclude &&
              anymatch(this.opts.exclude, this.file.opts.filename) === true)
          ) {
            doNotTraverse = true;
          }
        },
        exit: path => {
          if (path.scope.data.events) {
            path.node.body.push(
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier(globalOptions.moduleName),
                    t.identifier("delegateEvents")
                  ),
                  [
                    t.arrayExpression(
                      Array.from(path.scope.data.events).map(e =>
                        t.stringLiteral(e.toString())
                      )
                    )
                  ]
                )
              )
            );
          }
        }
      }
    }
  };
};
