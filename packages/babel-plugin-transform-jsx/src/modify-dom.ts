import * as t from "@babel/types";
import { parameters } from "./parameters";
import { Scope, NodePath } from "babel-traverse";
import { check } from "./check";

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

const attributeExpression = (
  fileName: string,
  scope: Scope,
  attributeName: string,
  expression: t.Expression,
  setAttr: boolean
) => {
  const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
    fileName,
    scope,
    expression
  );
  if (fComputeParameters.length == 0) return expression;

  const statements: t.ExpressionStatement[] = [];
  if (attributeName === "textContent") {
    statements.push(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.identifier("element"),
          t.callExpression(
            t.memberExpression(
              t.identifier("fidan"),
              t.identifier("createTextNode")
            ),
            [t.identifier("element")]
          )
        )
      )
    );
  }
  if (attributeName === "dangerouslySetInnerHTML") {
    attributeName = "innerHTML";
  }
  const fdCurrVal = t.identifier("fd_curr_val");
  statements.push(
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier("fidan"), t.identifier("computeBy")),
        [
          expression,
          t.functionExpression(
            t.identifier(""),
            [fdCurrVal, t.identifier("fd_prev_val")],
            t.blockStatement([
              t.expressionStatement(
                assignSetAttributeExpression(attributeName, fdCurrVal, setAttr)
              )
            ])
          )
        ].concat(fComputeParameters)
      )
    )
  );

  return t.functionExpression(
    t.identifier(""),
    [t.identifier("element")],
    t.blockStatement(statements)
  );
};

const assignSetAttributeExpression = (
  attributeName: string,
  expression: t.Expression,
  setAttr: boolean
) => {
  if (setAttr !== false && htmlProps[attributeName] !== true) {
    // TODO gereksiz ?
    setAttr = true;
  }
  if (setAttr)
    //TODO setAttributeNS ?
    return t.callExpression(
      t.memberExpression(t.identifier("element"), t.identifier("setAttribute")),
      [t.stringLiteral(attributeName), expression]
    );
  else
    return t.assignmentExpression(
      "=",
      t.memberExpression(t.identifier("element"), t.identifier(attributeName)),
      expression
    );
};

const setupStyleAttributeExpression = (
  fileName: string,
  scope: Scope,
  expression: t.ObjectExpression
) => {
  expression.properties.forEach((prop: t.ObjectProperty) => {
    if (!t.isLiteral(prop.value)) {
      prop.value = attributeExpression(
        fileName,
        scope,
        "style." + prop.key.name,
        prop.value as t.Expression,
        false
      );
    }
  });
};

const appendReplaceConditionallyExpression = (
  fileName: string,
  scope: Scope,
  expression: t.Expression
) => {
  const fComputeParameters = parameters.fidanComputeParametersInExpressionWithScopeFilter(
    fileName,
    scope,
    expression
  );
  if (fComputeParameters.length == 0) return expression;
  return t.functionExpression(
    t.identifier(""),
    [t.identifier("element")],
    t.blockStatement([
      t.variableDeclaration("let", [
        t.variableDeclarator(t.identifier("oldElement"))
      ]),
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier("fidan"), t.identifier("compute")),
          [
            t.functionExpression(
              t.identifier(""),
              [],
              t.blockStatement([
                t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier("oldElement"),
                    t.callExpression(
                      t.memberExpression(
                        t.identifier("fidan"),
                        t.identifier("conditionalElement")
                      ),
                      [
                        t.identifier("element"),
                        t.identifier("oldElement"),
                        t.functionExpression(
                          null,
                          [],
                          t.blockStatement([t.returnStatement(expression)])
                        )
                      ]
                    )
                  )
                )
              ])
            )
          ].concat(fComputeParameters)
        )
      )
    ])
  );
};

const arrayMapExpression = (
  fileName: string,
  scope: Scope,
  expression: t.CallExpression
) => {
  const arrayName = [];
  let callMember = expression.callee["object"];
  while (true) {
    if (t.isIdentifier(callMember)) {
      arrayName.push(callMember.name);
      break;
    } else {
      if (callMember.property.name !== "$val")
        arrayName.push(callMember.property.name);
      callMember = callMember.object as t.MemberExpression;
    }
  }
  let returnStatement: t.ReturnStatement | t.JSXElement = null;
  const returnFn = expression.arguments[0];

  if (
    t.isArrowFunctionExpression(returnFn) ||
    t.isFunctionExpression(returnFn)
  ) {
    if (t.isBlockStatement(returnFn.body)) {
      returnStatement = returnFn.body.body[
        returnFn.body.body.length - 1
      ] as t.ReturnStatement;
      if (!t.isReturnStatement(returnStatement))
        throw "returnStatement must be last place in the block";
    } else if (t.isJSXElement(returnFn.body)) returnStatement = returnFn.body;

    if (returnStatement == null)
      throw "ERROR: returnStatement cannot be found in arrayMapExpression";

    if (t.isReturnStatement(returnStatement)) {
      if (t.isConditionalExpression(returnStatement.argument)) {
        returnStatement.argument = appendReplaceConditionallyExpression(
          fileName,
          scope,
          returnStatement.argument
        );
      }
    } else if (t.isConditionalExpression(returnStatement)) {
      returnFn.body = appendReplaceConditionallyExpression(
        fileName,
        scope,
        returnFn.body as t.Expression
      );
    }
  }

  return t.functionExpression(
    t.identifier(""),
    [t.identifier("element")],
    t.blockStatement([
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier("fidan"), t.identifier("arrayMap")),
          [
            t.identifier(arrayName.reverse().join(".")),
            t.identifier("element"),
            expression.arguments[0]
          ]
        )
      )
    ])
  );
};

export const fidanObjectExpression = (
  path: NodePath<t.CallExpression>,
  node: t.ObjectExpression,
  file
) => {
  node.properties.forEach((property: t.ObjectProperty) => {
    const leftIsTracked =
      check.isTrackedVariable(path.scope, property.key) ||
      check.isTrackedVariable(path.scope, property);
    const rightIsTracked = check.isTrackedVariable(path.scope, property.value);
    const rightIsDynamic = check.isDynamicExpression(property.value);
    if (rightIsTracked || rightIsDynamic) {
      // TODO component controlü: class-names-4
      if (!leftIsTracked) {
        property.value = modifyDom.attributeExpression(
          file.finame,
          path.scope,
          property.key.name.toString(),
          property.value as t.Expression,
          false
        );
      }
    }
  });
};

export const modifyDom = {
  attributeExpression,
  setupStyleAttributeExpression,
  appendReplaceConditionallyExpression,
  arrayMapExpression,
  fidanObjectExpression
};
