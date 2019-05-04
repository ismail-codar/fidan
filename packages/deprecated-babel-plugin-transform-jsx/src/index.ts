import * as babylon from "babylon";
import traverse from "@babel/traverse";
import { NodePath, Scope } from "babel-traverse";
import * as t from "@babel/types";
import { check, checker } from "./check";
import { modify } from "./modify";
import { parameters } from "./parameters";
import { found } from "./found";
import { modifyDom } from "./modify-dom";
import generate from "@babel/generator";
import { realpathSync } from "fs";
import { join } from "path";

var micromatch = require("micromatch");

const errorReport = (e: Error, path: NodePath<any>, file) => {
  const nodeCode = generate(path.node).code;
  console.log("FILE: ", file.filename);
  console.log("PART: ", nodeCode);
  console.error("ERROR: ", e);
  debugger;
};

function getRealpath(n) {
  try {
    return realpathSync(n) || n;
  } catch (e) {
    return n;
  }
}

var doNotTraverse = false;
const openedTags: string[] = [];

export default function() {
  return {
    visitor: {
      Program: {
        enter(path) {
          if (!this.opts) return;
          doNotTraverse = false;
          try {
            if (
              (this.file.opts.filename.endsWith(".tsx") ||
                this.file.opts.filename.endsWith(".jsx")) &&
              !process.env.IS_TEST
            ) {
              const pragma = found.filePluginOptions(
                "transform-react-jsx",
                this.file.opts.plugins
              ).pragma;
              const body: t.BaseNode[] = path.node.body;
              if (!found.hasFidanImport(body)) {
                modify.insertFidanImport(body, 0);
              }
              if (pragma && pragma !== "React.createElement") {
                modify.insertPragma(body, pragma, 1);
              }
            }
            if (
              (this.opts.include &&
                micromatch(this.file.opts.filename, this.opts.include, {
                  matchBase: true
                }).length === 0) ||
              (this.opts.exclude &&
                micromatch(this.file.opts.filename, this.opts.exclude, {
                  matchBase: true
                }).length)
            ) {
              doNotTraverse = true;
            }
            if (this.opts.checkFn) {
              var checkerFunctions = require(join(
                this.file.opts.cwd,
                this.opts.checkFn
              ));
              if (checkerFunctions)
                for (var key in checkerFunctions) {
                  checker[key] = checkerFunctions[key];
                }
            }
          } catch (e) {
            errorReport(e, path, this.file);
          }
        }
      },
      MemberExpression(path: NodePath<t.MemberExpression>, file) {
        if (doNotTraverse) return;
        try {
          if (
            t.isIdentifier(path.node.object) &&
            path.node.object.name === "React"
          ) {
            path.node.object.name = "fidan";
          }
          const isExport = check.isExportsMember(path.node);
          if (!isExport) {
            if (
              (t.isMemberExpression(path.parent) &&
                path.parent.property.name === "$val") == false &&
              check.isTrackedVariable(path.scope, path.node) &&
              t.isIdentifier(path.node.object) &&
              !check.isTrackedVariable(
                path.parentPath.scope,
                path.parentPath.node
              ) &&
              !check.isFidanCall(path.parentPath.node) &&
              !t.isAssignmentExpression(path.parentPath.node) // object-property-3
            ) {
              path.node.object = t.memberExpression(
                path.node.object,
                t.identifier(path.node.property.name)
              );
              modify.renameToVal(path.node, "property");
            } else if (
              check.specialMemberAccessKeywords.indexOf(
                path.node.property.name
              ) === -1 &&
              check.isTrackedVariable(path.scope, path.node.object)
            ) {
              path.node.object = modify.memberVal(path.node.object);
            } else if (
              t.isMemberExpression(path.node.property) &&
              t.isCallExpression(path.parentPath.node) === false &&
              t.isVariableDeclarator(path.parentPath.node) === false &&
              check.isTrackedVariable(path.scope, path.node.property) &&
              (t.isMemberExpression(path.parentPath.node) &&
                path.parentPath.node.property.name === "$val") == false
            ) {
              //object-indexed-property-1
              path.node.property = modify.memberVal(path.node.property);
            }
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      VariableDeclarator(path: NodePath<t.VariableDeclarator>, file) {
        if (doNotTraverse) return;
        try {
          if (
            t.isVariableDeclaration(path.parent) &&
            check.isTrackedVariable(path.scope, path.node)
          ) {
            if (path.node.init && check.isDynamicExpression(path.node.init)) {
              const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
                file.filename,
                path.scope,
                path.node.init
              );
              if (fComputeParameters.length > 0) {
                path.node.init = modify.dynamicExpressionInitComputeValues(
                  path.node.init,
                  fComputeParameters
                );
              } else if (
                !check.isTrackedVariable(path.scope, path.node.init) &&
                !t.isCallExpression(path.node.init)
              )
                path.node.init = modify.fidanValueInit(path.node.init);
            } else if (
              !check.isTrackedVariable(path.scope, path.node.init) &&
              !t.isCallExpression(path.node.init) //freezed-1
            ) {
              if (
                check.isTrackedVariable(path.scope, path.node) &&
                t.isObjectExpression(path.node.init)
              ) {
                //variable-object-2
                const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
                  file.filename,
                  path.scope,
                  path.node.init
                );
                if (fComputeParameters.length > 0) {
                  path.node.init = modify.dynamicExpressionInitComputeValues(
                    path.node.init,
                    fComputeParameters
                  );
                }
              } else path.node.init = modify.fidanValueInit(path.node.init);
            }
          } else if (
            check.isTrackedVariable(path.scope, path.node.init) ||
            check.isTrackedVariable(path.scope, path.node.id) // variable-init-1
          ) {
            path.node.init = modify.memberVal(path.node.init);
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      LogicalExpression(path: NodePath<t.LogicalExpression>, file) {
        if (doNotTraverse) return;
        try {
          modify.pathNodeLeftRight(path);
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      BinaryExpression(path: NodePath<t.BinaryExpression>, file) {
        if (doNotTraverse) return;
        try {
          modify.pathNodeLeftRight(path);
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      ObjectExpression(path: NodePath<t.ObjectExpression>, file) {
        if (doNotTraverse) return;
        try {
          const isFidanObjectProperty = check.isFidanCall(path.node);
          path.node.properties.forEach((property: t.ObjectProperty) => {
            const leftIsTracked =
              check.isTrackedVariable(path.scope, property.key) ||
              check.isTrackedVariable(path.scope, property);
            const rightIsTracked = check.isTrackedVariable(
              path.scope,
              property.value
            );
            if (rightIsTracked) {
              if (!leftIsTracked && !isFidanObjectProperty) {
                property.value = modify.memberVal(property.value);
              }
            } else if (leftIsTracked) {
              const rightIsDynamic = check.isDynamicExpression(property.value);
              if (rightIsDynamic) {
                const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
                  file.filename,
                  path.scope,
                  property.value
                );
                if (fComputeParameters.length > 0) {
                  property.value = modify.dynamicExpressionInitComputeValues(
                    property.value,
                    fComputeParameters
                  );
                } else if (!check.isFidanCall(property.value))
                  property.value = modify.fidanValueInit(property.value);
              } else if (
                !check.isFidanCall(property.value) &&
                !check.isFidanElementFunction(property.value)
              )
                property.value = modify.fidanValueInit(property.value);
            }
          });
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      CallExpression(path: NodePath<t.CallExpression>, file) {
        if (doNotTraverse) return;
        try {
          if (
            t.isMemberExpression(path.node.callee) &&
            path.node.callee.property.name == "createElement" &&
            check.isFidanCall(path.node)
          ) {
            const firstArgument = path.node.arguments[0];
            const secondArgument: any =
              path.node.arguments.length > 1 ? path.node.arguments[1] : null;
            if (t.isStringLiteral(firstArgument)) {
              if (check.isSvgElementTagName(firstArgument.value, openedTags))
                path.node.callee.property.name = "createSvgElement";
            }

            let jsxFactoryName = null;
            if (t.isIdentifier(firstArgument)) {
              let variableBinding = found.variableBindingInScope(
                path.scope,
                firstArgument.name
              );
              if (
                variableBinding &&
                t.isImportDeclaration(variableBinding.path.parent)
              ) {
                const importPath = variableBinding.path.parent.source.value;
                if (
                  this.opts.exclude &&
                  micromatch(importPath + ".", this.opts.exclude, {
                    matchBase: true
                  }).length
                ) {
                  jsxFactoryName = importPath.substr(
                    importPath.lastIndexOf(".") + 1
                  );
                }
              }
            }
            if (jsxFactoryName === null) {
              const elementFactoryPropIndex =
                secondArgument && secondArgument.properties
                  ? secondArgument.properties.findIndex(
                      item => item.key.name === "elementFactory"
                    )
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
            if (
              t.isObjectExpression(secondArgument) &&
              !check.nameIsComponent(firstArgumentName)
            ) {
              modifyDom.fidanObjectExpression(path, secondArgument, file);
            }
          }

          const contextArgumentIndex = found.findContextChildIndex(
            path.node.arguments
          );
          if (contextArgumentIndex !== -1) {
            modify.moveContextArguments(
              path.node.arguments,
              contextArgumentIndex
            );
          } else if (!check.isFidanCall(path.node)) {
            const methodParams = found.callingMethodParams(path, file.filename);
            // if (!methodParams || path.node.arguments.length !== methodParams.length) {
            // 	// debugger;
            // 	// throw "callingMethodParams is not found";
            // }
            const methodCallIsTracked = check.isTrackedVariable(
              path.scope,
              path.node
            );
            path.node.arguments.forEach((argument, index) => {
              const paramIsTracked =
                methodParams &&
                check.isTrackedVariable(path.scope, methodParams[index]);
              const paramValueIsTracked = check.isTrackedVariable(
                path.scope,
                argument
              );
              // methodParams && check.isTrackedVariable(path.scope, methodParams[index]);
              if (paramIsTracked) {
                if (methodCallIsTracked) {
                  //condition-2
                  path.node.arguments[index] = modify.memberVal(
                    path.node.arguments[index]
                  );
                } else if (!paramValueIsTracked) {
                  //call-2 call-3
                  path.node.arguments[index] = modify.fidanValueInit(
                    path.node.arguments[index]
                  );
                }
              } else {
                if (paramValueIsTracked) {
                  //array-map-4 sortBy
                  path.node.arguments[index] = modify.memberVal(
                    path.node.arguments[index]
                  );
                }
              }
            });
          } else if (check.isComputeReturnExpression(path.node)) {
            debugger;
            const returnFunction = path.node
              .arguments[0] as t.FunctionExpression;
            const list = [];
            parameters.checkFunctionBody(
              [],
              [],
              path.scope,
              returnFunction.body,
              list
            );
            if (list.length) {
              list.forEach(arg => {
                // TODO check if exists
                path.node.arguments.push(arg);
              });
            }
          } else {
            path.node.arguments.forEach((argument, index) => {
              if (check.isArrayMapExpression(path.scope, argument as any)) {
                path.node.arguments[index] = modifyDom.arrayMapExpression(
                  file.filename,
                  path.scope,
                  argument as any
                );
              }
            });
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      ConditionalExpression(path: NodePath<t.ConditionalExpression>, file) {
        if (doNotTraverse) return;
        try {
          if (check.isTrackedVariable(path.scope, path.node.consequent)) {
            path.node.consequent = modify.memberVal(path.node.consequent);
          }
          if (check.isTrackedVariable(path.scope, path.node.alternate)) {
            path.node.alternate = modify.memberVal(path.node.alternate);
          }
          if (check.isTrackedVariable(path.scope, path.node.test)) {
            path.node.test = modify.memberVal(path.node.test);
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      ArrowFunctionExpression(path: NodePath<t.ArrowFunctionExpression>, file) {
        if (doNotTraverse) return;
        try {
          modify.expressionStatementGeneralProcess(
            file.filename,
            path.scope,
            "body",
            path
          );
        } catch (e) {
          errorReport(e, path, file);
        }
      },

      IfStatement(path: NodePath<t.IfStatement>, file) {
        if (doNotTraverse) return;
        try {
          if (
            t.isIdentifier(path.node.test) &&
            check.isTrackedVariable(path.scope, path.node.test)
          ) {
            //if-1
            path.node.test = modify.memberVal(path.node.test);
          } else if (
            t.isMemberExpression(path.node.test) &&
            check.isTrackedVariable(path.scope, path.node.test.property)
          ) {
            //if-2
            path.node.test = modify.memberVal(path.node.test);
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      ExpressionStatement(path: NodePath<t.ExpressionStatement>, file) {
        if (doNotTraverse) return;
        try {
          modify.expressionStatementGeneralProcess(
            file.filename,
            path.scope,
            "expression",
            path
          );
        } catch (e) {
          errorReport(e, path, file);
        }
      },
      JSXOpeningElement(path: NodePath<t.JSXOpeningElement>, file) {
        openedTags.push(path.node.name["name"]);
      },
      JSXClosingElement(path: NodePath<t.JSXClosingElement>, file) {
        openedTags.pop();
      },
      JSXExpressionContainer(path: NodePath<t.JSXExpressionContainer>, file) {
        if (doNotTraverse) return;
        try {
          if (
            t.isCallExpression(path.node.expression) === false && //class-names-4 vs component-1
            check.expressionContainerParentIsComponent(path)
          )
            return;
          if (t.isJSXAttribute(path.container))
            if (
              t.isObjectExpression(path.node.expression) &&
              path.container.name.name.toString() === "style"
            )
              //style-member-access, style-conditional
              modifyDom.setupStyleAttributeExpression(
                file.filename,
                path.scope,
                path.node.expression
              );
            else {
              const parentIsComponent = check.objectPropertyParentIsComponent(
                path
              );
              const componentPropertyIsTracked = check.isTrackedVariable(
                path.scope,
                path.container.name
              );
              if (
                t.isCallExpression(path.node.expression) &&
                componentPropertyIsTracked
              ) {
                //class-names-6
                const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
                  file.filename,
                  path.scope,
                  path.node.expression
                );
                if (fComputeParameters.length)
                  path.node.expression = modify.dynamicExpressionInitComputeValues(
                    path.node.expression,
                    fComputeParameters
                  );
                else
                  path.node.expression = modify.fidanValueInit(
                    path.node.expression
                  );
              } else if (!parentIsComponent && !componentPropertyIsTracked) {
                // TODO bir yerde parent null olduğu için getProgramParent da hata oluşuyor
                // bu hataya düşmemek için jsx içinde <div>{functionMethod(...)}</div> gibi kullanımdan kaçınılmalı
                // onun yerine var view1 = functionMethod(...) .... <div>{view}</div> gibi kullanılabilir
                path.node.expression = modifyDom.attributeExpression(
                  file.filename,
                  path.scope,
                  path.container.name.name.toString(),
                  path.node.expression as t.Expression,
                  check.isSvgElementTagName(
                    found.pathElementTagName(path),
                    openedTags
                  )
                );
              }
            }
          else if (
            check.isValMemberProperty(path.node.expression) ||
            check.isTrackedVariable(path.scope, path.node.expression) ||
            t.isBinaryExpression(path.node.expression) ||
            (t.isCallExpression(path.node.expression) &&
              !check.isArrayMapExpression(path.scope, path.node.expression))
          ) {
            if (t.isJSXElement(path.parent) || t.isJSXFragment(path.parent)) {
              path.node.expression = modifyDom.attributeExpression(
                file.filename,
                path.scope,
                "textContent",
                path.node.expression as t.Expression,
                false
              );
            }
          } else if (t.isConditionalExpression(path.node.expression)) {
            //element-text-conditional
            path.node.expression = modifyDom.appendReplaceConditionallyExpression(
              file.filename,
              path.scope,
              path.node.expression
            );
          } else if (
            t.isCallExpression(path.node.expression) &&
            check.isArrayMapExpression(path.scope, path.node.expression)
          ) {
            //array-map
            path.node.expression = modifyDom.arrayMapExpression(
              file.filename,
              path.scope,
              path.node.expression
            );
          }
        } catch (e) {
          errorReport(e, path, file);
        }
      }
    }
  };
}
