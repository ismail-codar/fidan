"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// original: https://github.com/ryansolid/babel-plugin-jsx-dom-expressions/blob/master/src/index.js
const t = require("@babel/types");
const plugin_syntax_jsx_1 = require("@babel/plugin-syntax-jsx");
const generate_1 = require("./generate");
const ast_1 = require("./ast");
exports.globalOptions = { moduleName: "_r$", delegateEvents: true };
exports.default = babel => {
    return {
        name: "ast-transform",
        inherits: plugin_syntax_jsx_1.default,
        visitor: {
            JSXElement: (path, { opts }) => {
                if ("moduleName" in opts)
                    exports.globalOptions.moduleName = opts.moduleName;
                if ("delegateEvents" in opts)
                    exports.globalOptions.delegateEvents = opts.delegateEvents;
                const result = generate_1.generateHTMLNode(path, path.node, opts);
                if (result.id) {
                    ast_1.createTemplate(path, result);
                    if (!result.exprs.length && result.decl.declarations.length === 1)
                        path.replaceWith(result.decl.declarations[0].init);
                    else
                        path.replaceWithMultiple([result.decl].concat(result.exprs, t.expressionStatement(result.id)));
                }
                else
                    path.replaceWith(result.exprs[0]);
            },
            JSXFragment: (path, { opts }) => {
                if ("moduleName" in opts)
                    exports.globalOptions.moduleName = opts.moduleName;
                if ("delegateEvents" in opts)
                    exports.globalOptions.delegateEvents = opts.delegateEvents;
                const result = generate_1.generateHTMLNode(path, path.node, opts);
                ast_1.createTemplate(path, result, true);
                if (!result.exprs.length && result.decl.declarations.length === 1)
                    path.replaceWith(result.decl.declarations[0].init);
                else
                    path.replaceWithMultiple([result.decl].concat(result.exprs, t.expressionStatement(result.id)));
            },
            Program: {
                exit: path => {
                    if (path.scope.data.events) {
                        path.node.body.push(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier(exports.globalOptions.moduleName), t.identifier("delegateEvents")), [
                            t.arrayExpression(Array.from(path.scope.data.events).map(e => t.stringLiteral(e.toString())))
                        ])));
                    }
                }
            }
        }
    };
};
//# sourceMappingURL=index.js.map