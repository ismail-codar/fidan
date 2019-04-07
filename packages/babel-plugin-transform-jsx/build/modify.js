"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const check_1 = require("./check");
const parameters_1 = require("./parameters");
const fidanValueInit = (init) => {
    return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier(t.isArrayExpression(init) ? 'array' : 'value')), [init == null ? t.nullLiteral() : init]);
};
const fidanCall = (left, right, operator) => {
    if (operator === '=')
        return t.callExpression(left, [right]);
    else {
        operator = operator.substr(0, 1);
        return t.callExpression(left, [t.binaryExpression(operator, left, right)]);
    }
};
const assignmentExpressionToCallCompute = (expression, fComputeParameters) => {
    if (t.isMemberExpression(expression.left) &&
        t.isIdentifier(expression.left.object) &&
        expression.left.property.name === '$val')
        return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('compute')), [
            t.functionExpression(t.identifier(''), [], t.blockStatement([
                t.expressionStatement(t.callExpression(expression.left.object, [expression.right]))
            ]))
        ].concat(fComputeParameters));
};
const dynamicExpressionInitComputeValues = (expression, fComputeParameters) => {
    return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('initCompute')), [
        t.functionExpression(t.identifier(''), [], t.blockStatement([t.returnStatement(expression)]))
    ].concat(fComputeParameters));
};
const fidanAssignmentExpressionSetCompute = (expression, fComputeParameters) => {
    const leftName = t.isIdentifier(expression.left) ? expression.left.name : 'TODO';
    return t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('setCompute')), [
        t.identifier(leftName),
        t.functionExpression(t.identifier(''), [], t.blockStatement([t.returnStatement(expression.right)]))
    ].concat(fComputeParameters));
};
const expressionStatementGeneralProcess = (fileName, scope, propertyName, path) => {
    const expression = path.node[propertyName];
    if (t.isAssignmentExpression(expression)) {
        // const code = generate(path.node).code;
        const isExport = check_1.check.isExportsMember(expression.left);
        if (t.isMemberExpression(expression.left) && !isExport) {
            const rightIsFidanCall = check_1.check.isFidanCall(expression.right);
            if (rightIsFidanCall)
                return;
            const leftIsTracked = check_1.check.isTrackedVariable(path.scope, expression.left);
            const rightIsTracked = check_1.check.isTrackedVariable(path.scope, expression.right);
            if (leftIsTracked && check_1.check.isClassPropertyLike(path, expression) === false) {
                // class-property-1
                if (rightIsTracked)
                    return;
                else {
                    if (check_1.check.isDynamicExpression(expression.right)) {
                        const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(fileName, path.scope, expression.right);
                        if (fComputeParameters.length > 0) {
                            expression.right = dynamicExpressionInitComputeValues(expression.right, fComputeParameters);
                            return;
                        }
                    }
                    expression.right = fidanValueInit(expression.right);
                    return;
                }
            }
            if (rightIsTracked) {
                if (leftIsTracked) {
                    path.node[propertyName] = exports.modify.fidanCall(expression.left, expression.right, expression.operator);
                }
            }
            else {
                if (leftIsTracked) {
                    path.node[propertyName] = exports.modify.fidanCall(expression.left, expression.right, expression.operator);
                }
            }
        }
        if (check_1.check.isTrackedVariable(scope, expression.left) && t.isBinaryExpression(expression.right)) {
            // variable-binary-call-1 setCompute
            const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(fileName, path.scope, expression.right);
            const containsAnotherTracked = fComputeParameters.find((param) => {
                const node = t.isMemberExpression(param) ? param.object : param;
                if (t.isIdentifier(node) && t.isIdentifier(expression.left)) {
                    if (node.name === expression.left.name) {
                        return false;
                    }
                }
                return check_1.check.isTrackedVariable(scope, node);
            }) != null;
            if (containsAnotherTracked) {
                expression.right = exports.modify.fidanAssignmentExpressionSetCompute(expression, fComputeParameters);
            }
            else {
                // export-1
                path.node[propertyName] = exports.modify.fidanCall(expression.left, expression.right, expression.operator);
            }
        }
        else if (!isExport && t.isAssignmentExpression(expression)) {
            const leftIsTracked = check_1.check.isTrackedVariable(path.scope, expression.left);
            const rightIsTracked = check_1.check.isTrackedVariable(path.scope, expression.right);
            if (leftIsTracked &&
                !(t.isMemberExpression(expression.left) && expression.left.object.type === 'ThisExpression'))
                path.node[propertyName] = exports.modify.fidanCall(expression.left, expression.right, expression.operator);
            else if (rightIsTracked && !check_1.check.isExportsMember(expression.left)) {
                expression.right = exports.modify.memberVal(expression.right);
            }
        }
    }
    else if (t.isUpdateExpression(expression)) {
        if (check_1.check.isTrackedVariable(path.scope, expression.argument)) {
            path.node[propertyName] = exports.modify.fidanCall(expression.argument, t.numericLiteral(1), expression.operator);
        }
    }
};
const memberVal = (expression) => {
    if (t.isUnaryExpression(expression)) {
        expression.argument = t.memberExpression(expression.argument, t.identifier('$val'));
        return expression;
    }
    else
        return t.memberExpression(expression, t.identifier('$val'));
};
const renameToVal = (node, property) => {
    node[property] = t.identifier('$val');
};
exports.moveContextArguments = (args, contextArgIndex) => {
    const contextArgProps = args[contextArgIndex].arguments[1].properties;
    const contextArgs = args[contextArgIndex].arguments.splice(2);
    contextArgs.push(t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('endContext')), [
        contextArgProps[0].value
    ]));
    args[contextArgIndex] = t.callExpression(t.memberExpression(t.identifier('fidan'), t.identifier('startContext')), [
        contextArgProps[0].value,
        contextArgProps[1].value
    ]);
    args.splice.apply(args, [contextArgIndex + 1, 0].concat(contextArgs));
};
exports.pathNodeLeftRight = (path) => {
    if (t.isIdentifier(path.node.left)) {
        if (check_1.check.isTrackedVariable(path.scope, path.node.left)) {
            path.node.left = exports.modify.memberVal(path.node.left);
        }
    }
    else if (t.isMemberExpression(path.node.left)) {
        if (check_1.check.isTrackedVariable(path.scope, path.node.left)) {
            path.node.left = exports.modify.memberVal(path.node.left);
        }
    }
    if (t.isIdentifier(path.node.right)) {
        if (check_1.check.isTrackedVariable(path.scope, path.node.right)) {
            path.node.right = exports.modify.memberVal(path.node.right);
        }
    }
    else if (t.isMemberExpression(path.node.right)) {
        if (check_1.check.isTrackedVariable(path.scope, path.node.right)) {
            path.node.right = exports.modify.memberVal(path.node.right);
        }
    }
};
const insertPragma = (body, pragma, start) => {
    body.splice(start, 0, t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(pragma), t.memberExpression(t.identifier('fidan'), t.identifier('createElement')))
    ]));
};
exports.insertFidanImport = (body, start) => {
    body.splice(start, 0, t.importDeclaration([t.importSpecifier(t.identifier('fidan'), t.identifier('fidan'))], t.stringLiteral('@fidanjs/runtime')));
};
exports.modify = {
    fidanValueInit,
    fidanCall,
    memberVal,
    renameToVal,
    dynamicExpressionInitComputeValues,
    assignmentExpressionToCallCompute,
    fidanAssignmentExpressionSetCompute,
    expressionStatementGeneralProcess,
    moveContextArguments: exports.moveContextArguments,
    pathNodeLeftRight: exports.pathNodeLeftRight,
    insertPragma,
    insertFidanImport: exports.insertFidanImport
};
//# sourceMappingURL=modify.js.map