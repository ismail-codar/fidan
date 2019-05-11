// original: https://github.com/ryansolid/babel-plugin-jsx-dom-expressions/blob/master/src/index.js
import * as t from "@babel/types";
import * as anymatch from "anymatch";

import SyntaxJSX from "@babel/plugin-syntax-jsx";
import { generateHTMLNode } from "./generate";
import { createTemplate } from "./ast";
import {
  insertFidanImport,
  isSvgElementTagName,
  jsxParentComponent,
  setComponentPropsToDom
} from "./util";
import { NodePath } from "babel-traverse";
import generate from "@babel/generator";

const fileExtentions = [".js", ".jsx", ".ts", ".tsx"];
export const globalOptions = {
  moduleName: "_r$",
  delegateEvents: true,
  isTest: false,
  babelConfig: (pluginPath: string) => ({
    plugins: [
      pluginPath
        ? [
            pluginPath,
            {
              moduleName: "_r$",
              isTest: true,
              exclude: ["**/*.react*"]
            }
          ]
        : null,
      "@babel/plugin-syntax-dynamic-import",
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      "@babel/plugin-syntax-jsx"
    ].filter(p => p != null),
    presets: ["@babel/preset-typescript"]
  }),
  fileExtentions: fileExtentions,
  currentFile: {
    path: ""
  },
  defaultPluginOptions: {
    include: fileExtentions.map(ext => "**/*" + ext)
  },
  openedTags: [],
  isSvg: false
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
        if (path.node.openingElement)
          globalOptions.isSvg = isSvgElementTagName(
            path.node.openingElement.name.name
          );
        const result = generateHTMLNode(path, path.node, opts);
        if (result.id) {
          createTemplate(path, result);
          if (!result.exprs.length && result.decl.declarations.length === 1)
            path.replaceWith(result.decl.declarations[0].init);
          else {
            setComponentPropsToDom(path, result);
            path.replaceWithMultiple(
              [result.decl].concat(
                result.exprs,
                t.expressionStatement(result.id)
              )
            );
          }
        } else path.replaceWith(result.exprs[0]);
      },
      JSXFragment: (path, { opts }) => {
        try {
          if ("moduleName" in opts) globalOptions.moduleName = opts.moduleName;
          if ("delegateEvents" in opts)
            globalOptions.delegateEvents = opts.delegateEvents;
          if (path.node.openingElement)
            globalOptions.isSvg = isSvgElementTagName(
              path.node.openingElement.name.name
            );
          const result = generateHTMLNode(path, path.node, opts);
          createTemplate(path, result, true);
          if (!result.exprs.length && result.decl.declarations.length === 1)
            path.replaceWith(result.decl.declarations[0].init);
          else {
            setComponentPropsToDom(path, result);
            path.replaceWithMultiple(
              [result.decl].concat(
                result.exprs,
                t.expressionStatement(result.id)
              )
            );
          }
        } catch (e) {
          errorReport(e, path, globalOptions.currentFile.path);
        }
      },
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>, file) {
        globalOptions.openedTags.push(path.node.name["name"]);
      },
      JSXClosingElement(path: NodePath<t.JSXClosingElement>, file) {
        globalOptions.openedTags.pop();
      },
      Program: {
        enter(path) {
          globalOptions.currentFile.path = this.filename;
          globalOptions.isTest = false;
          const pluginOptions = Object.assign(
            globalOptions.defaultPluginOptions,
            this.opts
          );
          if (pluginOptions.moduleName) {
            globalOptions.moduleName = pluginOptions.moduleName;
          }
          if (pluginOptions.isTest) {
            globalOptions.isTest = true;
          }

          doNotTraverse = false;
          // https://github.com/micromatch/anymatch#usage
          if (
            (pluginOptions.include &&
              anymatch(pluginOptions.include, this.file.opts.filename) ===
                false) ||
            (pluginOptions.exclude &&
              anymatch(pluginOptions.exclude, this.file.opts.filename) === true)
          ) {
            doNotTraverse = true;
            return;
          }

          if (!globalOptions.isTest) {
            insertFidanImport(path.node.body);
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
