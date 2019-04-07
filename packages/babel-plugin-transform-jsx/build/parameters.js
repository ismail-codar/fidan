"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const check_1 = require("./check");
const generator_1 = require("@babel/generator");
const traverse_1 = require("@babel/traverse");
const found_1 = require("./found");
const listIncludes = (list, item) => {
    var itemCode = generator_1.default(item).code;
    if (itemCode.endsWith('.$val'))
        itemCode = itemCode.substr(0, itemCode.length - 5);
    return (list.find((listItem) => {
        var listItemCode = generator_1.default(listItem).code;
        if (listItemCode.endsWith('.$val'))
            listItemCode = listItemCode.substr(0, listItemCode.length - 5);
        return itemCode === listItemCode;
    }) != undefined);
};
const listAddWithControl = (scope, expression, list) => {
    if (check_1.check.isValMemberProperty(expression))
        list.push(expression.object);
    else if (check_1.check.isTrackedVariable(scope, expression))
        list.push(expression);
};
// TODO use traverse
const fidanComputeParametersInExpression = (fileName, scope, expression, list) => {
    if (t.isIdentifier(expression)) {
        if (!listIncludes(list, expression))
            listAddWithControl(scope, expression, list);
    }
    else if (t.isMemberExpression(expression)) {
        if (t.isIdentifier(expression.property)) {
            if (expression.property.name === '$val') {
                const objectValue = expression;
                if (!listIncludes(list, objectValue))
                    listAddWithControl(scope, objectValue, list);
            }
            else if (check_1.check.isTrackedVariable(scope, expression.property)) {
                const objectValue = expression;
                if (!listIncludes(list, objectValue))
                    listAddWithControl(scope, t.memberExpression(objectValue.object, objectValue.property), list);
            }
        }
        if (t.isIdentifier(expression.object)) {
            fidanComputeParametersInExpression(fileName, scope, expression.object, list);
        }
    }
    else if (t.isBinaryExpression(expression))
        checkBinaryExpression(fileName, scope, expression, list);
    else if (t.isLogicalExpression(expression))
        checkLogicalExpression(fileName, scope, expression, list);
    else if (t.isConditionalExpression(expression))
        checkConditionalExpression(fileName, scope, expression, list);
    else if (t.isUnaryExpression(expression))
        fidanComputeParametersInExpression(fileName, scope, expression.argument, list);
    else if (t.isCallExpression(expression)) {
        const methodName = t.isIdentifier(expression.callee) ? expression.callee.name : null;
        if (methodName) {
            let variableBinding = found_1.found.variableBindingInScope(scope, methodName);
            if (variableBinding) {
                if (t.isVariableDeclarator(variableBinding.path.node) ||
                    t.isFunctionDeclaration(variableBinding.path.node)) {
                    const nodeOrInit = t.isVariableDeclarator(variableBinding.path.node)
                        ? variableBinding.path.node.init
                        : variableBinding.path.node;
                    if (t.isFunctionExpression(nodeOrInit) ||
                        t.isArrowFunctionExpression(nodeOrInit) ||
                        t.isFunctionDeclaration(nodeOrInit))
                        checkFunctionBody(expression.arguments, nodeOrInit.params, scope, nodeOrInit.body, list);
                    else
                        throw 'ERROR: is not isFunctionExpression || isArrowFunctionExpression else ... not implemented -> ' +
                            variableBinding.path.node.type;
                }
                else if (t.isImportSpecifier(variableBinding.path.node) ||
                    t.isImportDefaultSpecifier(variableBinding.path.node)) {
                    // const exported = exportRegistry.loadImportedFileExports(
                    // 	fileName,
                    // 	variableBinding.path.parent['source'].value
                    // );
                    // exported.nodes.forEach((node) => {
                    // 	const exportedList = [];
                    // 	fidanComputeParametersInExpression(exported.fileName, scope, node as any, exportedList);
                    // 	debugger;
                    // });
                }
                else
                    throw 'ERROR: t.isVariableDeclarator(variableBinding.path.node) else ... not implemented -> ' +
                        variableBinding.path.node.type;
            }
        }
        checkExpressionList(fileName, scope, expression.arguments, list);
    }
    else if (t.isObjectExpression(expression)) {
        checkExpressionList(fileName, scope, expression.properties, list);
    }
    else if (t.isVariableDeclarator(expression)) {
        // else if (t.isFunctionExpression(expression)) {
        // 	checkFunctionExpression(fileName, scope, expression, list);
        // }
        fidanComputeParametersInExpression(fileName, scope, expression.init, list);
    }
    // else if (!t.isLiteral(expression) && !t.isIdentifier(expression)) {
    // 	throw 'ERROR: fidanComputeParametersInExpression -> ' + expression.type;
    // }
};
const checkFunctionExpression = (fileName, scope, expression, list) => {
    expression.body.body.forEach((statement) => {
        if (t.isReturnStatement(statement))
            fidanComputeParametersInExpression(fileName, scope, statement.argument, list);
        else {
            throw 'ERROR: checkFunctionExpression -> ' + expression.type;
        }
    });
};
// TODO make obsolete -> use checkFunctionExpression
const checkFunctionBody = (args, params, scope, body, list) => {
    traverse_1.default(body, {
        MemberExpression(path, file) {
            //props.xxx
            if (t.isIdentifier(path.node.object)) {
                const searchName = path.node.object.name;
                const argument = args[params.findIndex((p) => t.isIdentifier(p) && p.name == searchName)];
                let listItem = null;
                if (argument && t.isIdentifier(argument) && check_1.check.isTrackedVariable(scope, path.node.property)) {
                    listItem = t.memberExpression(argument, path.node.property);
                }
                else if (check_1.check.isTrackedVariable(scope, path.node.object)) {
                    const variableBinding = found_1.found.variableBindingInScope(scope, searchName);
                    // assuming that local variables cannot be found in passed scope
                    // if the variableBinding is found it is not local variable in this function
                    if (variableBinding) {
                        listItem = path.node.object;
                    }
                }
                else if (check_1.check.isTrackedVariable(scope, path.node.property)) {
                    listItem = t.memberExpression(path.node.object, path.node.property);
                }
                if (listItem && !listIncludes(list, listItem)) {
                    list.push(listItem);
                }
            }
        }
    }, scope);
};
const checkConditionalExpression = (fileName, scope, expression, list) => {
    fidanComputeParametersInExpression(fileName, scope, expression.test, list);
    if (t.isExpression(expression.consequent))
        fidanComputeParametersInExpression(fileName, scope, expression.consequent, list);
    if (t.isExpression(expression.alternate))
        fidanComputeParametersInExpression(fileName, scope, expression.alternate, list);
};
const checkBinaryExpression = (fileName, scope, expression, list) => {
    fidanComputeParametersInExpression(fileName, scope, expression.left, list);
    fidanComputeParametersInExpression(fileName, scope, expression.right, list);
};
const checkLogicalExpression = (fileName, scope, expression, list) => {
    fidanComputeParametersInExpression(fileName, scope, expression.left, list);
    fidanComputeParametersInExpression(fileName, scope, expression.right, list);
};
const checkExpressionList = (fileName, scope, argumentList, list) => {
    argumentList.forEach((arg) => {
        if (t.isExpression(arg))
            fidanComputeParametersInExpression(fileName, scope, arg, list);
        else if (t.isObjectProperty(arg))
            fidanComputeParametersInExpression(fileName, scope, arg.value, list);
        else
            throw 'ERROR: not implemented argument type in checkExpressionList';
    });
};
// TODO make obsolete
exports.fidanComputeParametersInExpressionWithScopeFilter = (fileName, scope, expression) => {
    const fComputeParameters = [];
    fidanComputeParametersInExpression(fileName, scope, expression, fComputeParameters);
    return fComputeParameters;
};
exports.parameters = {
    checkFunctionBody,
    fidanComputeParametersInExpressionWithScopeFilter: exports.fidanComputeParametersInExpressionWithScopeFilter
};
//# sourceMappingURL=parameters.js.map