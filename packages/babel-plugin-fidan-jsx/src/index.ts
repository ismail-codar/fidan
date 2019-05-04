// original: https://github.com/ryansolid/babel-plugin-jsx-dom-expressions/blob/master/src/index.js
import * as t from "@babel/types";

import SyntaxJSX from "@babel/plugin-syntax-jsx";
import { generateHTMLNode } from "./generate";
import { createTemplate } from "./ast";

export const globalOptions = { moduleName: "r$", delegateEvents: true };

export default babel => {
  return {
    name: "ast-transform",
    inherits: SyntaxJSX,
    visitor: {
      JSXElement: (path, { opts }) => {
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
        if ("moduleName" in opts) globalOptions.moduleName = opts.moduleName;
        if ("delegateEvents" in opts)
          globalOptions.delegateEvents = opts.delegateEvents;
        const result = generateHTMLNode(path, path.node, opts);
        createTemplate(path, result, true);
        if (!result.exprs.length && result.decl.declarations.length === 1)
          path.replaceWith(result.decl.declarations[0].init);
        else
          path.replaceWithMultiple(
            [result.decl].concat(result.exprs, t.expressionStatement(result.id))
          );
      },
      Program: {
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
