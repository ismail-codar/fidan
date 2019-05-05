import * as t from "@babel/types";
import { GenerationResultType } from "./types";
import { Attributes } from "./constants/Attributes";
import { globalOptions } from ".";
import generate from "@babel/generator";
import { NodePath } from "babel-traverse";

const errorReport = (e: Error, path: NodePath<any>, file) => {
  const nodeCode = generate(path.node).code;
  console.log("FILE: ", file.filename);
  console.log("PART: ", nodeCode);
  console.error("ERROR: ", e);
  debugger;
};

export function setAttr(elem, name, value) {
  if (name === "style") {
    return t.callExpression(
      t.memberExpression(t.identifier("Object"), t.identifier("assign")),
      [t.memberExpression(elem, t.identifier(name)), value]
    );
  }

  if (name === "classList") {
    return t.callExpression(
      t.memberExpression(
        t.identifier(globalOptions.moduleName),
        t.identifier("classList")
      ),
      [elem, value]
    );
  }

  let isAttribute = name.indexOf("-") > -1,
    attribute = Attributes[name];
  if (attribute)
    if (attribute.type === "attribute") isAttribute = true;
    else name = attribute.alias;

  if (isAttribute)
    return t.callExpression(
      t.memberExpression(elem, t.identifier("setAttribute")),
      [t.stringLiteral(name), value]
    );
  return t.assignmentExpression(
    "=",
    t.memberExpression(elem, t.identifier(name)),
    value
  );
}

export function setAttrExpr(elem, name, value) {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.identifier(globalOptions.moduleName),
        t.identifier("wrap")
      ),
      [t.arrowFunctionExpression([], setAttr(elem, name, value))]
    )
  );
}

export function computeAttribute(elem, name, value) {
  let isAttribute = name.indexOf("-") > -1,
    attribute = Attributes[name];
  if (attribute)
    if (attribute.type === "attribute") isAttribute = true;
    else name = attribute.alias;

  let expression: any = null;
  const isComputeIdentifier =
    t.isIdentifier(value) && value.name.startsWith("compute"); // TODO check definition
  const isComputeFn =
    t.isCallExpression(value) &&
    t.isIdentifier(value.callee) &&
    value.callee.name === "compute";
  const valueExpression = isComputeFn ? value.arguments[0] : value;
  let valueExpressionValue = null;
  if (isComputeFn || isComputeIdentifier) {
    valueExpressionValue = t.callExpression(valueExpression, []);
  } else {
    valueExpressionValue = value;
  }
  if (isAttribute) {
    expression = t.callExpression(
      t.memberExpression(elem, t.identifier("setAttribute")),
      [t.stringLiteral(name), valueExpressionValue]
    );
  } else {
    expression = t.assignmentExpression(
      "=",
      t.memberExpression(elem, t.identifier(name)),
      valueExpressionValue
    );
  }
  if (!isComputeFn && !isComputeIdentifier) {
    return expression;
  } else {
    const args: any[] = [
      t.functionExpression(
        t.identifier(""),
        [],
        t.blockStatement([t.expressionStatement(expression)])
      )
    ];
    if (t.isCallExpression(value) && value.arguments.length > 1) {
      args.push(value.arguments[1]);
    }
    return t.callExpression(t.identifier("compute"), args);
  }
}

export function createPlaceholder(path, results, tempPath, i) {
  const exprId = path.scope.generateUidIdentifier("el$");
  results.template += `<!--${exprId.name.slice(4)}-->`;
  results.decl.push(
    t.variableDeclarator(
      exprId,
      t.memberExpression(
        t.identifier(tempPath),
        t.identifier(i === 0 ? "firstChild" : "nextSibling")
      )
    )
  );
  return exprId;
}

export function createTemplate(
  path: any,
  results: GenerationResultType,
  isFragment?: boolean
) {
  let decl;
  if (results.template.length) {
    const templateId = path.scope.generateUidIdentifier("tmpl$"),
      program = path.findParent(t => t.isProgram()).node;
    decl = t.variableDeclarator(
      results.id,
      t.callExpression(
        isFragment
          ? t.memberExpression(
              t.memberExpression(templateId, t.identifier("content")),
              t.identifier("cloneNode")
            )
          : t.memberExpression(
              t.memberExpression(
                t.memberExpression(templateId, t.identifier("content")),
                t.identifier("firstChild")
              ),
              t.identifier("cloneNode")
            ),
        [t.booleanLiteral(true)]
      )
    );
    program.body.unshift(
      t.variableDeclaration("const", [
        t.variableDeclarator(
          templateId,
          t.callExpression(
            t.memberExpression(
              t.identifier("document"),
              t.identifier("createElement")
            ),
            [t.stringLiteral("template")]
          )
        )
      ]),
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(templateId, t.identifier("innerHTML")),
          t.stringLiteral(results.template)
        )
      )
    );
  } else {
    decl = t.variableDeclarator(
      results.id,
      t.callExpression(
        t.memberExpression(
          t.identifier("document"),
          t.identifier("createDocumentFragment")
        ),
        []
      )
    );
  }
  results.decl.unshift(decl);
  results.decl = t.variableDeclaration("const", results.decl);
}
