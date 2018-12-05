"use strict";
var t = require("@babel/types");
var plugin_syntax_jsx_1 = require("@babel/plugin-syntax-jsx");
module.exports = function (babel) {
    return {
        inherits: plugin_syntax_jsx_1["default"],
        name: 'transform-fidan-jsx',
        visitor: {
            JSXElement: function (path) {
                var refAttr = [];
                var restAttr = [];
                var refObject = null;
                for (var i = 0; i < path.node.openingElement.attributes.length; i++) {
                    var attr = path.node.openingElement.attributes[i];
                    if (t.isJSXSpreadAttribute(attr)) {
                        restAttr.push(attr);
                    }
                    else if (attr.name.name === 'ref') {
                        refAttr.push(attr);
                    }
                    else {
                        restAttr.push(attr);
                    }
                }
                if (refAttr.length) {
                    var attrValue = refAttr[refAttr.length - 1].value;
                    var refMember = null;
                    if (t.isJSXExpressionContainer(attrValue)) {
                        if (t.isMemberExpression(attrValue.expression)) {
                            refMember = attrValue.expression.property;
                            refObject = attrValue.expression.object;
                        }
                        else if (t.isIdentifier(attrValue.expression)) {
                            refMember = attrValue.expression;
                        }
                    }
                    else {
                        refMember = attrValue;
                    }
                    var assignToThis = t.assignmentExpression('=', refObject
                        ? t.memberExpression(refObject, t.stringLiteral(refMember.name), true)
                        : t.identifier(refMember.name), path.node);
                    path.node.openingElement.attributes = restAttr;
                    path.replaceWith(t.isJSXElement(path.parent) ? t.jsxExpressionContainer(assignToThis) : assignToThis);
                }
            }
        }
    };
};
