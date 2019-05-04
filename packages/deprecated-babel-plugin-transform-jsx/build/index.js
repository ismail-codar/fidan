"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const check_1 = require("./check");
const modify_1 = require("./modify");
const parameters_1 = require("./parameters");
const found_1 = require("./found");
const modify_dom_1 = require("./modify-dom");
const generator_1 = require("@babel/generator");
const fs_1 = require("fs");
const path_1 = require("path");
var micromatch = require("micromatch");
const errorReport = (e, path, file) => {
    const nodeCode = generator_1.default(path.node).code;
    console.log("FILE: ", file.filename);
    console.log("PART: ", nodeCode);
    console.error("ERROR: ", e);
    debugger;
};
function getRealpath(n) {
    try {
        return fs_1.realpathSync(n) || n;
    }
    catch (e) {
        return n;
    }
}
var doNotTraverse = false;
const openedTags = [];
function default_1() {
    return {
        visitor: {
            Program: {
                enter(path) {
                    if (!this.opts)
                        return;
                    doNotTraverse = false;
                    try {
                        if ((this.file.opts.filename.endsWith(".tsx") ||
                            this.file.opts.filename.endsWith(".jsx")) &&
                            !process.env.IS_TEST) {
                            const pragma = found_1.found.filePluginOptions("transform-react-jsx", this.file.opts.plugins).pragma;
                            const body = path.node.body;
                            if (!found_1.found.hasFidanImport(body)) {
                                modify_1.modify.insertFidanImport(body, 0);
                            }
                            if (pragma && pragma !== "React.createElement") {
                                modify_1.modify.insertPragma(body, pragma, 1);
                            }
                        }
                        if ((this.opts.include &&
                            micromatch(this.file.opts.filename, this.opts.include, {
                                matchBase: true
                            }).length === 0) ||
                            (this.opts.exclude &&
                                micromatch(this.file.opts.filename, this.opts.exclude, {
                                    matchBase: true
                                }).length)) {
                            doNotTraverse = true;
                        }
                        if (this.opts.checkFn) {
                            var checkerFunctions = require(path_1.join(this.file.opts.cwd, this.opts.checkFn));
                            if (checkerFunctions)
                                for (var key in checkerFunctions) {
                                    check_1.checker[key] = checkerFunctions[key];
                                }
                        }
                    }
                    catch (e) {
                        errorReport(e, path, this.file);
                    }
                }
            },
            MemberExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (t.isIdentifier(path.node.object) &&
                        path.node.object.name === "React") {
                        path.node.object.name = "fidan";
                    }
                    const isExport = check_1.check.isExportsMember(path.node);
                    if (!isExport) {
                        if ((t.isMemberExpression(path.parent) &&
                            path.parent.property.name === "$val") == false &&
                            check_1.check.isTrackedVariable(path.scope, path.node) &&
                            t.isIdentifier(path.node.object) &&
                            !check_1.check.isTrackedVariable(path.parentPath.scope, path.parentPath.node) &&
                            !check_1.check.isFidanCall(path.parentPath.node) &&
                            !t.isAssignmentExpression(path.parentPath.node) // object-property-3
                        ) {
                            path.node.object = t.memberExpression(path.node.object, t.identifier(path.node.property.name));
                            modify_1.modify.renameToVal(path.node, "property");
                        }
                        else if (check_1.check.specialMemberAccessKeywords.indexOf(path.node.property.name) === -1 &&
                            check_1.check.isTrackedVariable(path.scope, path.node.object)) {
                            path.node.object = modify_1.modify.memberVal(path.node.object);
                        }
                        else if (t.isMemberExpression(path.node.property) &&
                            t.isCallExpression(path.parentPath.node) === false &&
                            t.isVariableDeclarator(path.parentPath.node) === false &&
                            check_1.check.isTrackedVariable(path.scope, path.node.property) &&
                            (t.isMemberExpression(path.parentPath.node) &&
                                path.parentPath.node.property.name === "$val") == false) {
                            //object-indexed-property-1
                            path.node.property = modify_1.modify.memberVal(path.node.property);
                        }
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            VariableDeclarator(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (t.isVariableDeclaration(path.parent) &&
                        check_1.check.isTrackedVariable(path.scope, path.node)) {
                        if (path.node.init && check_1.check.isDynamicExpression(path.node.init)) {
                            const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(file.filename, path.scope, path.node.init);
                            if (fComputeParameters.length > 0) {
                                path.node.init = modify_1.modify.dynamicExpressionInitComputeValues(path.node.init, fComputeParameters);
                            }
                            else if (!check_1.check.isTrackedVariable(path.scope, path.node.init) &&
                                !t.isCallExpression(path.node.init))
                                path.node.init = modify_1.modify.fidanValueInit(path.node.init);
                        }
                        else if (!check_1.check.isTrackedVariable(path.scope, path.node.init) &&
                            !t.isCallExpression(path.node.init) //freezed-1
                        ) {
                            if (check_1.check.isTrackedVariable(path.scope, path.node) &&
                                t.isObjectExpression(path.node.init)) {
                                //variable-object-2
                                const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(file.filename, path.scope, path.node.init);
                                if (fComputeParameters.length > 0) {
                                    path.node.init = modify_1.modify.dynamicExpressionInitComputeValues(path.node.init, fComputeParameters);
                                }
                            }
                            else
                                path.node.init = modify_1.modify.fidanValueInit(path.node.init);
                        }
                    }
                    else if (check_1.check.isTrackedVariable(path.scope, path.node.init) ||
                        check_1.check.isTrackedVariable(path.scope, path.node.id) // variable-init-1
                    ) {
                        path.node.init = modify_1.modify.memberVal(path.node.init);
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            LogicalExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    modify_1.modify.pathNodeLeftRight(path);
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            BinaryExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    modify_1.modify.pathNodeLeftRight(path);
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            ObjectExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    const isFidanObjectProperty = check_1.check.isFidanCall(path.node);
                    path.node.properties.forEach((property) => {
                        const leftIsTracked = check_1.check.isTrackedVariable(path.scope, property.key) ||
                            check_1.check.isTrackedVariable(path.scope, property);
                        const rightIsTracked = check_1.check.isTrackedVariable(path.scope, property.value);
                        if (rightIsTracked) {
                            if (!leftIsTracked && !isFidanObjectProperty) {
                                property.value = modify_1.modify.memberVal(property.value);
                            }
                        }
                        else if (leftIsTracked) {
                            const rightIsDynamic = check_1.check.isDynamicExpression(property.value);
                            if (rightIsDynamic) {
                                const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(file.filename, path.scope, property.value);
                                if (fComputeParameters.length > 0) {
                                    property.value = modify_1.modify.dynamicExpressionInitComputeValues(property.value, fComputeParameters);
                                }
                                else if (!check_1.check.isFidanCall(property.value))
                                    property.value = modify_1.modify.fidanValueInit(property.value);
                            }
                            else if (!check_1.check.isFidanCall(property.value) &&
                                !check_1.check.isFidanElementFunction(property.value))
                                property.value = modify_1.modify.fidanValueInit(property.value);
                        }
                    });
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            CallExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (t.isMemberExpression(path.node.callee) &&
                        path.node.callee.property.name == "createElement" &&
                        check_1.check.isFidanCall(path.node)) {
                        const firstArgument = path.node.arguments[0];
                        const secondArgument = path.node.arguments.length > 1 ? path.node.arguments[1] : null;
                        if (t.isStringLiteral(firstArgument)) {
                            if (check_1.check.isSvgElementTagName(firstArgument.value, openedTags))
                                path.node.callee.property.name = "createSvgElement";
                        }
                        let jsxFactoryName = null;
                        if (t.isIdentifier(firstArgument)) {
                            let variableBinding = found_1.found.variableBindingInScope(path.scope, firstArgument.name);
                            if (variableBinding &&
                                t.isImportDeclaration(variableBinding.path.parent)) {
                                const importPath = variableBinding.path.parent.source.value;
                                if (this.opts.exclude &&
                                    micromatch(importPath + ".", this.opts.exclude, {
                                        matchBase: true
                                    }).length) {
                                    jsxFactoryName = importPath.substr(importPath.lastIndexOf(".") + 1);
                                }
                            }
                        }
                        if (jsxFactoryName === null) {
                            const elementFactoryPropIndex = secondArgument && secondArgument.properties
                                ? secondArgument.properties.findIndex(item => item.key.name === "elementFactory")
                                : -1;
                            if (elementFactoryPropIndex !== -1) {
                                //integration-1
                                jsxFactoryName =
                                    secondArgument.properties[elementFactoryPropIndex].value
                                        .value;
                                secondArgument.properties.splice(elementFactoryPropIndex, 1);
                            }
                        }
                        if (jsxFactoryName !== null) {
                            path.node.callee.property.name =
                                "createElementBy" +
                                    jsxFactoryName[0].toUpperCase() +
                                    jsxFactoryName.substr(1);
                        }
                        const firstArgumentName = t.isIdentifier(firstArgument)
                            ? firstArgument.name
                            : t.isStringLiteral(firstArgument)
                                ? firstArgument.value
                                : null;
                        if (t.isObjectExpression(secondArgument) &&
                            !check_1.check.nameIsComponent(firstArgumentName)) {
                            modify_dom_1.modifyDom.fidanObjectExpression(path, secondArgument, file);
                        }
                    }
                    const contextArgumentIndex = found_1.found.findContextChildIndex(path.node.arguments);
                    if (contextArgumentIndex !== -1) {
                        modify_1.modify.moveContextArguments(path.node.arguments, contextArgumentIndex);
                    }
                    else if (!check_1.check.isFidanCall(path.node)) {
                        const methodParams = found_1.found.callingMethodParams(path, file.filename);
                        // if (!methodParams || path.node.arguments.length !== methodParams.length) {
                        // 	// debugger;
                        // 	// throw "callingMethodParams is not found";
                        // }
                        const methodCallIsTracked = check_1.check.isTrackedVariable(path.scope, path.node);
                        path.node.arguments.forEach((argument, index) => {
                            const paramIsTracked = methodParams &&
                                check_1.check.isTrackedVariable(path.scope, methodParams[index]);
                            const paramValueIsTracked = check_1.check.isTrackedVariable(path.scope, argument);
                            // methodParams && check.isTrackedVariable(path.scope, methodParams[index]);
                            if (paramIsTracked) {
                                if (methodCallIsTracked) {
                                    //condition-2
                                    path.node.arguments[index] = modify_1.modify.memberVal(path.node.arguments[index]);
                                }
                                else if (!paramValueIsTracked) {
                                    //call-2 call-3
                                    path.node.arguments[index] = modify_1.modify.fidanValueInit(path.node.arguments[index]);
                                }
                            }
                            else {
                                if (paramValueIsTracked) {
                                    //array-map-4 sortBy
                                    path.node.arguments[index] = modify_1.modify.memberVal(path.node.arguments[index]);
                                }
                            }
                        });
                    }
                    else if (check_1.check.isComputeReturnExpression(path.node)) {
                        debugger;
                        const returnFunction = path.node
                            .arguments[0];
                        const list = [];
                        parameters_1.parameters.checkFunctionBody([], [], path.scope, returnFunction.body, list);
                        if (list.length) {
                            list.forEach(arg => {
                                // TODO check if exists
                                path.node.arguments.push(arg);
                            });
                        }
                    }
                    else {
                        path.node.arguments.forEach((argument, index) => {
                            if (check_1.check.isArrayMapExpression(path.scope, argument)) {
                                path.node.arguments[index] = modify_dom_1.modifyDom.arrayMapExpression(file.filename, path.scope, argument);
                            }
                        });
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            ConditionalExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (check_1.check.isTrackedVariable(path.scope, path.node.consequent)) {
                        path.node.consequent = modify_1.modify.memberVal(path.node.consequent);
                    }
                    if (check_1.check.isTrackedVariable(path.scope, path.node.alternate)) {
                        path.node.alternate = modify_1.modify.memberVal(path.node.alternate);
                    }
                    if (check_1.check.isTrackedVariable(path.scope, path.node.test)) {
                        path.node.test = modify_1.modify.memberVal(path.node.test);
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            ArrowFunctionExpression(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    modify_1.modify.expressionStatementGeneralProcess(file.filename, path.scope, "body", path);
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            IfStatement(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (t.isIdentifier(path.node.test) &&
                        check_1.check.isTrackedVariable(path.scope, path.node.test)) {
                        //if-1
                        path.node.test = modify_1.modify.memberVal(path.node.test);
                    }
                    else if (t.isMemberExpression(path.node.test) &&
                        check_1.check.isTrackedVariable(path.scope, path.node.test.property)) {
                        //if-2
                        path.node.test = modify_1.modify.memberVal(path.node.test);
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            ExpressionStatement(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    modify_1.modify.expressionStatementGeneralProcess(file.filename, path.scope, "expression", path);
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            },
            JSXOpeningElement(path, file) {
                openedTags.push(path.node.name["name"]);
            },
            JSXClosingElement(path, file) {
                openedTags.pop();
            },
            JSXExpressionContainer(path, file) {
                if (doNotTraverse)
                    return;
                try {
                    if (t.isCallExpression(path.node.expression) === false && //class-names-4 vs component-1
                        check_1.check.expressionContainerParentIsComponent(path))
                        return;
                    if (t.isJSXAttribute(path.container))
                        if (t.isObjectExpression(path.node.expression) &&
                            path.container.name.name.toString() === "style")
                            //style-member-access, style-conditional
                            modify_dom_1.modifyDom.setupStyleAttributeExpression(file.filename, path.scope, path.node.expression);
                        else {
                            const parentIsComponent = check_1.check.objectPropertyParentIsComponent(path);
                            const componentPropertyIsTracked = check_1.check.isTrackedVariable(path.scope, path.container.name);
                            if (t.isCallExpression(path.node.expression) &&
                                componentPropertyIsTracked) {
                                //class-names-6
                                const fComputeParameters = parameters_1.parameters.fidanComputeParametersInExpressionWithScopeFilter(file.filename, path.scope, path.node.expression);
                                if (fComputeParameters.length)
                                    path.node.expression = modify_1.modify.dynamicExpressionInitComputeValues(path.node.expression, fComputeParameters);
                                else
                                    path.node.expression = modify_1.modify.fidanValueInit(path.node.expression);
                            }
                            else if (!parentIsComponent && !componentPropertyIsTracked) {
                                // TODO bir yerde parent null olduğu için getProgramParent da hata oluşuyor
                                // bu hataya düşmemek için jsx içinde <div>{functionMethod(...)}</div> gibi kullanımdan kaçınılmalı
                                // onun yerine var view1 = functionMethod(...) .... <div>{view}</div> gibi kullanılabilir
                                path.node.expression = modify_dom_1.modifyDom.attributeExpression(file.filename, path.scope, path.container.name.name.toString(), path.node.expression, check_1.check.isSvgElementTagName(found_1.found.pathElementTagName(path), openedTags));
                            }
                        }
                    else if (check_1.check.isValMemberProperty(path.node.expression) ||
                        check_1.check.isTrackedVariable(path.scope, path.node.expression) ||
                        t.isBinaryExpression(path.node.expression) ||
                        (t.isCallExpression(path.node.expression) &&
                            !check_1.check.isArrayMapExpression(path.scope, path.node.expression))) {
                        if (t.isJSXElement(path.parent) || t.isJSXFragment(path.parent)) {
                            path.node.expression = modify_dom_1.modifyDom.attributeExpression(file.filename, path.scope, "textContent", path.node.expression, false);
                        }
                    }
                    else if (t.isConditionalExpression(path.node.expression)) {
                        //element-text-conditional
                        path.node.expression = modify_dom_1.modifyDom.appendReplaceConditionallyExpression(file.filename, path.scope, path.node.expression);
                    }
                    else if (t.isCallExpression(path.node.expression) &&
                        check_1.check.isArrayMapExpression(path.scope, path.node.expression)) {
                        //array-map
                        path.node.expression = modify_dom_1.modifyDom.arrayMapExpression(file.filename, path.scope, path.node.expression);
                    }
                }
                catch (e) {
                    errorReport(e, path, file);
                }
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map