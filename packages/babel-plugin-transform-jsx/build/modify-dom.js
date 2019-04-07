"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const parameters_1 = require("./parameters");
const check_1 = require("./check");
const htmlProps = {
    id: true,
    nodeValue: true,
    textContent: true,
    className: true,
    innerHTML: true,
    innerText: true,
    tabIndex: true,
    value: true
};
const attributeExpression = (fileName, scope, attributeName, expression, setAttr) => {
    const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(fileName, scope, expression);
    if (fComputeParameters.length == 0)
        return expression;
    const statements = [];
    if (attributeName === 'textContent') {
        statements.push(t.expressionStatement(t.assignmentExpression('=', t.identifier('element'), t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('createTextNode')), [
            t.identifier('element')
        ]))));
    }
    if (attributeName === 'dangerouslySetInnerHTML') {
        attributeName = 'innerHTML';
    }
    statements.push(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('compute')), [
        t.functionExpression(t.identifier(''), [], t.blockStatement([
            t.expressionStatement(assignSetAttributeExpression(attributeName, expression, setAttr))
        ]))
    ].concat(fComputeParameters))));
    return t.functionExpression(t.identifier(''), [t.identifier('element')], t.blockStatement(statements));
};
const assignSetAttributeExpression = (attributeName, expression, setAttr) => {
    if (setAttr !== false && htmlProps[attributeName] !== true) {
        // TODO gereksiz ?
        setAttr = true;
    }
    if (setAttr)
        //TODO setAttributeNS ?
        return t.callExpression(t.memberExpression(t.identifier('element'), t.identifier('setAttribute')), [
            t.stringLiteral(attributeName),
            expression
        ]);
    else
        return t.assignmentExpression('=', t.memberExpression(t.identifier('element'), t.identifier(attributeName)), expression);
};
const setupStyleAttributeExpression = (fileName, scope, expression) => {
    expression.properties.forEach((prop) => {
        if (!t.isLiteral(prop.value)) {
            prop.value = attributeExpression(fileName, scope, 'style.' + prop.key.name, prop.value, false);
        }
    });
};
const appendReplaceConditionallyExpression = (fileName, scope, expression) => {
    const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(fileName, scope, expression);
    if (fComputeParameters.length == 0)
        return expression;
    return t.functionExpression(t.identifier(''), [t.identifier('element')], t.blockStatement([
        t.variableDeclaration('let', [t.variableDeclarator(t.identifier('oldElement'))]),
        t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('compute')), [
            t.functionExpression(t.identifier(''), [], t.blockStatement([
                t.expressionStatement(t.assignmentExpression('=', t.identifier('oldElement'), t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('conditionalElement')), [
                    t.identifier('element'),
                    t.identifier('oldElement'),
                    t.functionExpression(null, [], t.blockStatement([t.returnStatement(expression)]))
                ])))
            ]))
        ].concat(fComputeParameters)))
    ]));
};
const arrayMapExpression = (fileName, scope, expression) => {
    const arrayName = [];
    let callMember = expression.callee['object'];
    while (true) {
        if (t.isIdentifier(callMember)) {
            arrayName.push(callMember.name);
            break;
        }
        else {
            if (callMember.property.name !== '$val')
                arrayName.push(callMember.property.name);
            callMember = callMember.object;
        }
    }
    let returnStatement = null;
    const returnFn = expression.arguments[0];
    if (t.isArrowFunctionExpression(returnFn) || t.isFunctionExpression(returnFn)) {
        if (t.isBlockStatement(returnFn.body)) {
            returnStatement = returnFn.body.body[returnFn.body.body.length - 1];
            if (!t.isReturnStatement(returnStatement))
                throw 'returnStatement must be last place in the block';
        }
        else if (t.isJSXElement(returnFn.body))
            returnStatement = returnFn.body;
        if (returnStatement == null)
            throw 'ERROR: returnStatement cannot be found in arrayMapExpression';
        if (t.isReturnStatement(returnStatement)) {
            if (t.isConditionalExpression(returnStatement.argument)) {
                returnStatement.argument = appendReplaceConditionallyExpression(fileName, scope, returnStatement.argument);
            }
        }
        else if (t.isConditionalExpression(returnStatement)) {
            returnFn.body = appendReplaceConditionallyExpression(fileName, scope, returnFn.body);
        }
    }
    return t.functionExpression(t.identifier(''), [t.identifier('element')], t.blockStatement([
        t.expressionStatement(t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('arrayMap')), [
            t.identifier(arrayName.reverse().join('.')),
            t.identifier('element'),
            expression.arguments[0]
        ]))
    ]));
};
exports.fidanObjectExpression = (path, node, file) => {
    node.properties.forEach((property) => {
        const leftIsTracked = check_1.check.isTrackedVariable(path.scope, property.key) ||
            check_1.check.isTrackedVariable(path.scope, property);
        const rightIsTracked = check_1.check.isTrackedVariable(path.scope, property.value);
        const rightIsDynamic = check_1.check.isDynamicExpression(property.value);
        if (rightIsTracked || rightIsDynamic) { // TODO component controlü: class-names-4
            if (!leftIsTracked) {
                property.value = exports.modifyDom.attributeExpression(file.finame, path.scope, property.key.name.toString(), property.value, false);
            }
        }
    });
};
exports.modifyDom = {
    attributeExpression,
    setupStyleAttributeExpression,
    appendReplaceConditionallyExpression,
    arrayMapExpression,
    fidanObjectExpression: exports.fidanObjectExpression
};
//# sourceMappingURL=modify-dom.js.map