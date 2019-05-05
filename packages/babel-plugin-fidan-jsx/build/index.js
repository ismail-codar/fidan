"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// original: https://github.com/ryansolid/babel-plugin-jsx-dom-expressions/blob/master/src/index.js
const t = require("@babel/types");
const anymatch = require("anymatch");
const plugin_syntax_jsx_1 = require("@babel/plugin-syntax-jsx");
const generate_1 = require("./generate");
const ast_1 = require("./ast");
const util_1 = require("./util");
exports.globalOptions = {
    moduleName: "_r$",
    delegateEvents: true,
    isTest: false
};
let doNotTraverse = false;
exports.default = babel => {
    return {
        name: "ast-transform",
        inherits: plugin_syntax_jsx_1.default,
        visitor: {
            JSXElement: (path, { opts }) => {
                if (doNotTraverse)
                    return;
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
                enter(path) {
                    exports.globalOptions.isTest = false;
                    if (this.opts.moduleName) {
                        exports.globalOptions.moduleName = this.opts.moduleName;
                    }
                    if (this.opts.isTest) {
                        exports.globalOptions.isTest = true;
                    }
                    if (!exports.globalOptions.isTest) {
                        const body = path.node.body;
                        util_1.insertFidanImport(body, 0);
                    }
                    doNotTraverse = false;
                    // https://github.com/micromatch/anymatch#usage
                    if ((this.opts.include &&
                        anymatch(this.opts.include, this.file.opts.filename) === false) ||
                        (this.opts.exclude &&
                            anymatch(this.opts.exclude, this.file.opts.filename) === true)) {
                        doNotTraverse = true;
                    }
                },
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