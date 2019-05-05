"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const _1 = require(".");
function getTagName(tag) {
    if (t.isJSXMemberExpression(tag.openingElement.name)) {
        return `${tag.openingElement.name.object.name}.${tag.openingElement.name.property.name}`;
    }
    else if (t.isJSXIdentifier(tag.openingElement.name)) {
        return tag.openingElement.name.name;
    }
}
exports.getTagName = getTagName;
function checkParens(jsx, path) {
    const e = path.hub.file.code.slice(jsx.start + 1, jsx.end - 1).trim();
    return e[0] === "(" && e[e.length - 1] === ")";
}
exports.checkParens = checkParens;
function toEventName(name) {
    return name.slice(2).toLowerCase();
}
exports.toEventName = toEventName;
function trimWhitespace(text) {
    return text
        .split("\n")
        .map((t, i) => {
        if (/^\s*$/.test(t))
            return "";
        if (i === 0)
            return t.replace(/\s+/g, " ");
        return t.replace(/^\s+/g, "").replace(/\s+/g, " ");
    })
        .join("");
}
exports.trimWhitespace = trimWhitespace;
function checkLength(children) {
    let i = 0;
    children.forEach(child => {
        if (!t.isJSXText(child) || !/^\s*$/.test(child.value))
            i++;
    });
    return i > 1;
}
exports.checkLength = checkLength;
// reduce unnecessary refs
function detectExpressions(jsx, index) {
    for (let i = index; i < jsx.children.length; i++) {
        if (t.isJSXExpressionContainer(jsx.children[i]))
            return true;
        if (t.isJSXElement(jsx.children[i])) {
            const tagName = getTagName(jsx.children[i]);
            if (tagName.toLowerCase() !== tagName)
                return true;
            if (jsx.children[i].openingElement.attributes.some(attr => t.isJSXSpreadAttribute(attr) ||
                t.isJSXExpressionContainer(attr.value)))
                return true;
            if (jsx.children[i].children.length)
                if (detectExpressions(jsx.children[i], 0))
                    return true;
        }
    }
}
exports.detectExpressions = detectExpressions;
exports.insertFidanImport = (body) => {
    body.splice(0, 0, t.variableDeclaration("var", [
        t.variableDeclarator(t.identifier(_1.globalOptions.moduleName), t.callExpression(t.identifier("require"), [
            t.stringLiteral("@fidanjs/jsx")
        ]))
    ]));
};
//# sourceMappingURL=util.js.map