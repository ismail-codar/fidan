"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const VoidElements_1 = require("./constants/VoidElements");
const _1 = require(".");
const NonComposedEvents_1 = require("./constants/NonComposedEvents");
const ast_1 = require("./ast");
const util_1 = require("./util");
function generateComponent(path, jsx, opts) {
    let props = [], runningObject = [], exprs, dynamic = [], children = [];
    jsx.openingElement.attributes.forEach(attribute => {
        if (t.isJSXSpreadAttribute(attribute)) {
            if (runningObject.length) {
                props.push(t.objectExpression(runningObject));
                runningObject = [];
            }
            if (attribute.argument["extra"] &&
                attribute.argument["extra"].parenthesized) {
                const key = t.identifier("k$"), memo = t.identifier("m$");
                dynamic.push(t.spreadElement(t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("keys")), [attribute.argument])));
                props.push(t.callExpression(t.memberExpression(t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("keys")), [attribute.argument]), t.identifier("reduce")), [
                    t.arrowFunctionExpression([memo, key], t.assignmentExpression("=", t.memberExpression(memo, key, true), t.arrowFunctionExpression([], t.memberExpression(attribute.argument, key, true)))),
                    t.objectExpression([])
                ]));
            }
            else
                props.push(attribute.argument);
        }
        else {
            const value = attribute.value;
            if (t.isJSXExpressionContainer(value)) {
                const valueExpression = value.expression;
                if (attribute.name.name === "ref") {
                    runningObject.push(t.objectProperty(t.identifier("ref"), t.arrowFunctionExpression([t.identifier("ref$")], t.assignmentExpression("=", valueExpression, t.identifier("ref$")))));
                }
                else if (attribute.name.name === "forwardRef") {
                    runningObject.push(t.objectProperty(t.identifier("ref"), valueExpression));
                }
                else if (util_1.checkParens(value, path)) {
                    dynamic.push(t.stringLiteral(attribute.name.name));
                    runningObject.push(t.objectProperty(t.identifier(attribute.name.name), t.arrowFunctionExpression([], valueExpression)));
                }
                else
                    runningObject.push(t.objectProperty(t.identifier(attribute.name.name), valueExpression));
            }
            else {
                runningObject.push(t.objectProperty(t.identifier(attribute.name.name), value));
            }
        }
    });
    jsx.children.forEach(child => {
        child = generateHTMLNode(path, child, opts);
        if (child == null)
            return;
        if (child.id) {
            ast_1.createTemplate(path, child);
            if (!child.exprs.length && child.decl.declarations.length === 1)
                children.push(child.decl.declarations[0].init);
            else
                children.push(t.callExpression(t.arrowFunctionExpression([], t.blockStatement([
                    child.decl,
                    ...child.exprs,
                    t.returnStatement(child.id)
                ])), []));
        }
        else
            children.push(child.exprs[0]);
    });
    if (children.length)
        runningObject.push(t.objectProperty(t.identifier("children"), t.arrayExpression(children)));
    if (runningObject.length)
        props.push(t.objectExpression(runningObject));
    if (props.length > 1)
        props = [
            t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("assign")), props)
        ];
    if (dynamic.length) {
        exprs = [
            t.callExpression(t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("createComponent")), [t.identifier(util_1.getTagName(jsx)), props[0], t.arrayExpression(dynamic)])
        ];
    }
    else
        exprs = [t.callExpression(t.identifier(util_1.getTagName(jsx)), props)];
    return { exprs, template: "" };
}
function transformAttributes(path, jsx, results) {
    let elem = results.id;
    const spread = t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("spread"));
    jsx.openingElement.attributes.forEach(attribute => {
        if (t.isJSXSpreadAttribute(attribute)) {
            if (attribute.argument["extra"] &&
                attribute.argument["extra"].parenthesized) {
                results.exprs.push(t.expressionStatement(t.callExpression(spread, [
                    elem,
                    t.arrowFunctionExpression([], attribute.argument)
                ])));
            }
            else
                results.exprs.push(t.expressionStatement(t.callExpression(spread, [elem, attribute.argument])));
            return;
        }
        let value = attribute.value, key = attribute.name.name;
        if (t.isJSXExpressionContainer(value)) {
            const valueExpression = value.expression;
            if (key === "ref") {
                results.exprs.unshift(t.expressionStatement(t.assignmentExpression("=", valueExpression, elem)));
            }
            else if (key === "forwardRef") {
                results.exprs.unshift(t.expressionStatement(t.logicalExpression("&&", valueExpression, t.callExpression(valueExpression, [elem]))));
            }
            else if (key.startsWith("on")) {
                const ev = util_1.toEventName(key);
                if (_1.globalOptions.delegateEvents &&
                    key !== key.toLowerCase() &&
                    !NonComposedEvents_1.NonComposedEvents.has(ev)) {
                    const events = path.scope.getProgramParent()["data"].events ||
                        (path.scope.getProgramParent()["data"].events = new Set());
                    events.add(ev);
                    results.exprs.unshift(t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier(elem.name), t.identifier(`__${ev}`)), valueExpression)));
                }
                else {
                    results.exprs.unshift(t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier(elem.name), t.identifier(`on${ev}`)), valueExpression)));
                }
            }
            else if (key === "events") {
                value.expression.properties.forEach(prop => {
                    if (t.isObjectProperty(prop)) {
                        results.exprs.push(t.expressionStatement(t.callExpression(t.memberExpression(elem, t.identifier("addEventListener")), [
                            t.stringLiteral(prop.key.name || prop.key.value),
                            prop.value
                        ])));
                    }
                    else {
                        debugger;
                        throw "NotImplemented -> transformAttributes -> events -> " +
                            prop.toString();
                    }
                });
            }
            else if (key.startsWith("$")) {
                results.exprs.unshift(t.expressionStatement(t.callExpression(t.identifier(key.slice(1)), [
                    elem,
                    t.arrowFunctionExpression([], value.expression)
                ])));
            }
            else if (!value || util_1.checkParens(value, path)) {
                results.exprs.push(ast_1.setAttrExpr(elem, key, value.expression));
            }
            else {
                results.exprs.push(t.expressionStatement(ast_1.computeAttribute(elem, key, value.expression)));
            }
        }
        else {
            if (key === "className")
                key = "class";
            results.template += ` ${key}`;
            if (value)
                results.template += `='${value.value}'`;
        }
    });
}
function transformChildren(path, jsx, opts, results) {
    let tempPath = results.id && results.id.name, i = 0;
    jsx.children.forEach((jsxChild, index) => {
        const child = generateHTMLNode(path, jsxChild, opts, {
            skipId: !results.id || !util_1.detectExpressions(jsx, index)
        });
        if (!child)
            return;
        results.template += child.template;
        if (child.id) {
            results.decl.push(t.variableDeclarator(child.id, t.memberExpression(t.identifier(tempPath), t.identifier(i === 0 ? "firstChild" : "nextSibling"))));
            results.decl.push(...child.decl);
            results.exprs.push(...child.exprs);
            tempPath = child.id.name;
            i++;
        }
        else if (child.exprs.length) {
            if ((t.isJSXFragment(jsx) && util_1.checkParens(jsxChild, path)) ||
                util_1.checkLength(jsx.children)) {
                let exprId = ast_1.createPlaceholder(path, results, tempPath, i);
                results.exprs.push(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("insert")), [results.id, child.exprs[0], t.nullLiteral(), exprId])));
                tempPath = exprId.name;
                i++;
            }
            else
                results.exprs.push(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("insert")), [results.id, child.exprs[0]])));
        }
    });
}
function generateHTMLNode(path, jsx, opts, info = { skipId: undefined }) {
    if (t.isJSXElement(jsx)) {
        let tagName = util_1.getTagName(jsx), voidTag = VoidElements_1.default.indexOf(tagName) > -1;
        // if (tagName === "$") return generateFlow(jsx);
        if (tagName !== tagName.toLowerCase())
            return generateComponent(path, jsx, opts);
        let results = {
            id: undefined,
            template: `<${tagName}`,
            decl: [],
            exprs: []
        };
        if (!info.skipId)
            results.id = path.scope.generateUidIdentifier("el$");
        transformAttributes(path, jsx, results);
        if (!voidTag) {
            results.template += ">";
            transformChildren(path, jsx, opts, results);
            results.template += `</${tagName}>`;
        }
        else
            results.template += "/>";
        return results;
    }
    else if (t.isJSXFragment(jsx)) {
        let results = { template: "", decl: [], exprs: [] };
        if (!info.skipId)
            results.id = path.scope.generateUidIdentifier("el$");
        transformChildren(path, jsx, opts, results);
        return results;
    }
    else if (t.isJSXText(jsx)) {
        if (/^\s*$/.test(jsx.value))
            return null;
        let results = {
            template: util_1.trimWhitespace(jsx.value),
            decl: [],
            exprs: []
        };
        if (!info.skipId)
            results.id = path.scope.generateUidIdentifier("el$");
        return results;
    }
    else if (t.isJSXExpressionContainer(jsx)) {
        if (!util_1.checkParens(jsx, path))
            return { exprs: [jsx.expression], template: "" };
        return {
            exprs: [t.arrowFunctionExpression([], jsx.expression)],
            template: ""
        };
    }
}
exports.generateHTMLNode = generateHTMLNode;
//# sourceMappingURL=generate.js.map