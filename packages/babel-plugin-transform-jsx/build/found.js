"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const export_registry_1 = require("./export-registry");
const callMemberExpressionCheck = (expression, checkFn) => {
    if (t.isMemberExpression(expression.callee)) {
        return memberExpressionCheck(expression.callee, checkFn);
    }
};
const memberExpressionCheck = (expression, checkFn) => {
    var member = expression;
    while (true) {
        if (t.isIdentifier(member.object) || t.isStringLiteral(member.object)) {
            if (checkFn(member)) {
                return member;
            }
            else {
                return null;
            }
        }
        else if (t.isMemberExpression(member.object))
            member = member.object;
        else if (t.isCallExpression(member.object))
            return callMemberExpressionCheck(member.object, checkFn);
        else if (t.isMemberExpression(member))
            return member.property;
    }
};
const parentPathFound = (path, check) => {
    while (path && !check(path))
        path = path.parentPath;
    return path;
};
const variableBindingInScope = (scope, searchName) => {
    while (scope != null && searchName) {
        for (var bindingKey in scope.bindings) {
            if (bindingKey == searchName) {
                return scope.bindings[bindingKey];
            }
        }
        scope = scope.parent;
    }
    return null;
};
const callingMethodParamsInNode = (callee, node) => {
    let foundParams = [];
    if (t.isFunctionDeclaration(node)) {
        foundParams = node.params;
    }
    else if (t.isVariableDeclarator(node)) {
        if (t.isFunctionExpression(node.init) || t.isArrowFunctionExpression(node.init)) {
            foundParams = node.init.params;
        }
        else if (t.isObjectExpression(node.init)) {
            let calleName = null;
            if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
                //call-6
                calleName = callee.property.name;
            }
            else if (t.isIdentifier(callee)) {
                // attribute-call-1
                calleName = callee.name;
            }
            // else throw 'ERROR: not implemented in callingMethodParams -> ' + callee.type;
            calleName &&
                node.init.properties.every((prop) => {
                    if (t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key) &&
                        prop.key.name === calleName &&
                        t.isFunctionExpression(prop.value)) {
                        foundParams = prop.value.params;
                        return false;
                    }
                    else
                        return true;
                });
        }
    }
    return foundParams;
};
const callingMethodParams = (path, filename) => {
    var foundParams = null;
    const callee = path.node.callee;
    let searchName = t.isIdentifier(callee)
        ? callee.name
        : t.isMemberExpression(callee) && t.isIdentifier(callee.object) ? callee.object.name : null;
    // if (!searchName) {
    // 	if (t.isStringLiteral(callee)) {
    // 		searchName = callee.value;
    // 	} else if (t.isMemberExpression(callee)) {
    // 		if (t.isStringLiteral(callee.object)) {
    // 			searchName = callee.object.value;
    // 		}
    // 	}
    // }
    if (searchName) {
        const foundPath = parentPathFound(path, (checkPath) => {
            const variableBinding = checkPath.scope.bindings[searchName];
            if (variableBinding) {
                if (t.isVariableDeclarator(variableBinding.path.node) ||
                    t.isFunctionDeclaration(variableBinding.path.node)) {
                    foundParams = callingMethodParamsInNode(callee, variableBinding.path.node);
                    if (foundParams)
                        return true;
                }
                else if (t.isImportSpecifier(variableBinding.path.node) ||
                    t.isImportDefaultSpecifier(variableBinding.path.node)) {
                    const exported = export_registry_1.exportRegistry.loadImportedFileExports(filename, variableBinding.path.parent['source'].value);
                    exported.nodes.find((node) => {
                        foundParams = callingMethodParamsInNode(callee, node);
                        return foundParams !== null;
                    });
                    if (foundParams)
                        return true;
                    return true;
                }
                else if (t.isIdentifier(variableBinding.path.node)) {
                    // do nothing
                    // svg-compute-1
                }
                else
                    throw 'ERROR: unknown variableBinding type in callingMethodParams -> ' +
                        variableBinding.path.node.type;
            }
        });
    }
    // else {
    // 	throw 'ERROR: searchName not found in callingMethodParams -> ' + JSON.stringify(path.node.callee.loc);
    // }
    return foundParams;
};
const findContextChildIndex = (args) => {
    return args.findIndex((arg) => {
        if (t.isCallExpression(arg) && arg.arguments.length && t.isMemberExpression(arg.arguments[0])) {
            const memberExpression = arg.arguments[0];
            if (t.isIdentifier(memberExpression.property) && memberExpression.property.name == 'Context') {
                return true;
            }
            else
                return false;
        }
        else
            return false;
    });
};
const pathElementTagName = (path) => {
    if (t.isJSXOpeningElement(path.parentPath.parentPath.node) &&
        t.isJSXIdentifier(path.parentPath.parentPath.node.name))
        return path.parentPath.parentPath.node.name.name;
    return null;
};
const filePluginOptions = (pluginName, plugins) => {
    const plugin = plugins.find((p) => p.key.indexOf(pluginName) !== -1);
    return plugin ? plugin.options || {} : { options: {} };
};
const hasFidanImport = (body) => {
    return (body.find((node) => {
        if (t.isImportDeclaration(node)) {
            const fidanImport = node.specifiers.find((specifier) => t.isImportSpecifier(specifier) && specifier.imported.name === 'fidan');
            if (fidanImport)
                return true;
        }
        return false;
    }) != null);
};
exports.found = {
    callMemberExpressionCheck,
    memberExpressionCheck,
    parentPathFound,
    variableBindingInScope,
    callingMethodParams,
    findContextChildIndex,
    pathElementTagName,
    filePluginOptions,
    hasFidanImport
};
//# sourceMappingURL=found.js.map