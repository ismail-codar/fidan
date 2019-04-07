"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const check_1 = require("./check");
const modify_1 = require("./modify");
const modify_dom_1 = require("./modify-dom");
const parameters_1 = require("./parameters");
exports.modifyFidanObjectExpression = (path, node, file) => {
    node.properties.forEach((property) => {
        const leftIsTracked = check_1.check.isTrackedVariable(path.scope, property.key) ||
            check_1.check.isTrackedVariable(path.scope, property);
        const rightIsTracked = check_1.check.isTrackedVariable(path.scope, property.value);
        const rightIsDynamic = check_1.check.isDynamicExpression(property.value);
        if (rightIsTracked || rightIsDynamic) { // TODO component controlü: class-names-4
            if (!leftIsTracked) {
                property.value = modify_dom_1.modifyDom.attributeExpression(file.finame, path.scope, property.key.name.toString(), property.value, false);
            }
        }
        else if (leftIsTracked) {
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
};
//# sourceMappingURL=modify-object.js.map