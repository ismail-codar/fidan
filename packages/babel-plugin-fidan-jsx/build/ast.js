"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const Attributes_1 = require("./constants/Attributes");
const _1 = require(".");
function setAttr(elem, name, value) {
    if (name === "style") {
        return t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("assign")), [t.memberExpression(elem, t.identifier(name)), value]);
    }
    if (name === "classList") {
        return t.callExpression(t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("classList")), [elem, value]);
    }
    let isAttribute = name.indexOf("-") > -1, attribute = Attributes_1.Attributes[name];
    if (attribute)
        if (attribute.type === "attribute")
            isAttribute = true;
        else
            name = attribute.alias;
    if (isAttribute)
        return t.callExpression(t.memberExpression(elem, t.identifier("setAttribute")), [t.stringLiteral(name), value]);
    return t.assignmentExpression("=", t.memberExpression(elem, t.identifier(name)), value);
}
exports.setAttr = setAttr;
function setAttrExpr(elem, name, value) {
    return t.expressionStatement(t.callExpression(t.memberExpression(t.identifier(_1.globalOptions.moduleName), t.identifier("wrap")), [t.arrowFunctionExpression([], setAttr(elem, name, value))]));
}
exports.setAttrExpr = setAttrExpr;
function createPlaceholder(path, results, tempPath, i) {
    const exprId = path.scope.generateUidIdentifier("el$");
    results.template += `<!--${exprId.name.slice(4)}-->`;
    results.decl.push(t.variableDeclarator(exprId, t.memberExpression(t.identifier(tempPath), t.identifier(i === 0 ? "firstChild" : "nextSibling"))));
    return exprId;
}
exports.createPlaceholder = createPlaceholder;
function createTemplate(path, results, isFragment) {
    let decl;
    if (results.template.length) {
        const templateId = path.scope.generateUidIdentifier("tmpl$"), program = path.findParent(t => t.isProgram()).node;
        decl = t.variableDeclarator(results.id, t.callExpression(isFragment
            ? t.memberExpression(t.memberExpression(templateId, t.identifier("content")), t.identifier("cloneNode"))
            : t.memberExpression(t.memberExpression(t.memberExpression(templateId, t.identifier("content")), t.identifier("firstChild")), t.identifier("cloneNode")), [t.booleanLiteral(true)]));
        program.body.unshift(t.variableDeclaration("const", [
            t.variableDeclarator(templateId, t.callExpression(t.memberExpression(t.identifier("document"), t.identifier("createElement")), [t.stringLiteral("template")]))
        ]), t.expressionStatement(t.assignmentExpression("=", t.memberExpression(templateId, t.identifier("innerHTML")), t.stringLiteral(results.template))));
    }
    else {
        decl = t.variableDeclarator(results.id, t.callExpression(t.memberExpression(t.identifier("document"), t.identifier("createDocumentFragment")), []));
    }
    results.decl.unshift(decl);
    results.decl = t.variableDeclaration("const", results.decl);
}
exports.createTemplate = createTemplate;
//# sourceMappingURL=ast.js.map