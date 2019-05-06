import * as t from "@babel/types";

import { GenerationResultType } from "./types";
import VoidElements from "./constants/VoidElements";
import { NodePath } from "babel-traverse";
import { globalOptions } from ".";
import { NonComposedEvents } from "./constants/NonComposedEvents";
import {
  createTemplate,
  setAttrExpr,
  setAttr,
  createPlaceholder,
  computeAttribute
} from "./ast";
import {
  getTagName,
  checkParens,
  toEventName,
  checkLength,
  trimWhitespace,
  detectExpressions
} from "./util";
import { declarationInScope } from "./export-registry";

function generateComponent(path, jsx, opts): GenerationResultType {
  let props = [],
    runningObject = [],
    exprs,
    dynamic = [],
    children = [];

  jsx.openingElement.attributes.forEach(attribute => {
    if (t.isJSXSpreadAttribute(attribute)) {
      if (runningObject.length) {
        props.push(t.objectExpression(runningObject));
        runningObject = [];
      }
      if (
        attribute.argument["extra"] &&
        attribute.argument["extra"].parenthesized
      ) {
        const key = t.identifier("k$"),
          memo = t.identifier("m$");
        dynamic.push(
          t.spreadElement(
            t.callExpression(
              t.memberExpression(t.identifier("Object"), t.identifier("keys")),
              [attribute.argument]
            )
          )
        );
        props.push(
          t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier("Object"),
                  t.identifier("keys")
                ),
                [attribute.argument]
              ),
              t.identifier("reduce")
            ),
            [
              t.arrowFunctionExpression(
                [memo, key],
                t.assignmentExpression(
                  "=",
                  t.memberExpression(memo, key, true),
                  t.arrowFunctionExpression(
                    [],
                    t.memberExpression(attribute.argument, key, true)
                  )
                )
              ),
              t.objectExpression([])
            ]
          )
        );
      } else props.push(attribute.argument);
    } else {
      const value = attribute.value;
      if (t.isJSXExpressionContainer(value)) {
        const valueExpression = value.expression as any;
        if (attribute.name.name === "ref") {
          runningObject.push(
            t.objectProperty(
              t.identifier("ref"),
              t.arrowFunctionExpression(
                [t.identifier("ref$")],
                t.assignmentExpression(
                  "=",
                  valueExpression,
                  t.identifier("ref$")
                )
              )
            )
          );
        } else if (attribute.name.name === "forwardRef") {
          runningObject.push(
            t.objectProperty(t.identifier("ref"), valueExpression)
          );
        } else if (checkParens(value, path)) {
          dynamic.push(t.stringLiteral(attribute.name.name));
          runningObject.push(
            t.objectProperty(
              t.identifier(attribute.name.name),
              t.arrowFunctionExpression([], valueExpression)
            )
          );
        } else
          runningObject.push(
            t.objectProperty(t.identifier(attribute.name.name), valueExpression)
          );
      } else {
        runningObject.push(
          t.objectProperty(t.identifier(attribute.name.name), value)
        );
      }
    }
  });

  jsx.children.forEach(child => {
    child = generateHTMLNode(path, child, opts);
    if (child == null) return;
    if (child.id) {
      createTemplate(path, child);
      if (!child.exprs.length && child.decl.declarations.length === 1)
        children.push(child.decl.declarations[0].init);
      else
        children.push(
          t.callExpression(
            t.arrowFunctionExpression(
              [],
              t.blockStatement([
                child.decl,
                ...child.exprs,
                t.returnStatement(child.id)
              ])
            ),
            []
          )
        );
    } else children.push(child.exprs[0]);
  });

  if (children.length)
    runningObject.push(
      t.objectProperty(t.identifier("children"), t.arrayExpression(children))
    );

  if (runningObject.length) props.push(t.objectExpression(runningObject));

  if (props.length > 1)
    props = [
      t.callExpression(
        t.memberExpression(t.identifier("Object"), t.identifier("assign")),
        props
      )
    ];

  if (dynamic.length) {
    exprs = [
      t.callExpression(
        t.memberExpression(
          t.identifier(globalOptions.moduleName),
          t.identifier("createComponent")
        ),
        [t.identifier(getTagName(jsx)), props[0], t.arrayExpression(dynamic)]
      )
    ];
  } else exprs = [t.callExpression(t.identifier(getTagName(jsx)), props)];
  return { exprs, template: "" };
}

function transformAttributes(path: NodePath<any>, jsx, results) {
  let elem = results.id;
  const spread = t.memberExpression(
    t.identifier(globalOptions.moduleName),
    t.identifier("spread")
  );
  jsx.openingElement.attributes.forEach(attribute => {
    if (t.isJSXSpreadAttribute(attribute)) {
      if (
        attribute.argument["extra"] &&
        attribute.argument["extra"].parenthesized
      ) {
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(spread, [
              elem,
              t.arrowFunctionExpression([], attribute.argument)
            ])
          )
        );
      } else
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(spread, [elem, attribute.argument])
          )
        );
      return;
    }

    let value = attribute.value,
      key = attribute.name.name;
    if (t.isJSXExpressionContainer(value)) {
      const valueExpression = value.expression as any;
      if (key === "ref") {
        results.exprs.unshift(
          t.expressionStatement(
            t.assignmentExpression("=", valueExpression, elem)
          )
        );
      } else if (key === "forwardRef") {
        results.exprs.unshift(
          t.expressionStatement(
            t.logicalExpression(
              "&&",
              valueExpression,
              t.callExpression(valueExpression, [elem])
            )
          )
        );
      } else if (key.startsWith("on")) {
        const ev = toEventName(key);
        if (
          globalOptions.delegateEvents &&
          key !== key.toLowerCase() &&
          !NonComposedEvents.has(ev)
        ) {
          const events =
            path.scope.getProgramParent()["data"].events ||
            (path.scope.getProgramParent()["data"].events = new Set());
          events.add(ev);
          results.exprs.unshift(
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(
                  t.identifier(elem.name),
                  t.identifier(`__${ev}`)
                ),
                valueExpression
              )
            )
          );
        } else {
          results.exprs.unshift(
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(
                  t.identifier(elem.name),
                  t.identifier(`on${ev}`)
                ),
                valueExpression
              )
            )
          );
        }
      } else if (key === "events") {
        (value.expression as t.ObjectExpression).properties.forEach(prop => {
          if (t.isObjectProperty(prop)) {
            results.exprs.push(
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(elem, t.identifier("addEventListener")),
                  [
                    t.stringLiteral(prop.key.name || prop.key.value),
                    prop.value as t.Expression
                  ]
                )
              )
            );
          } else {
            debugger;
            throw "NotImplemented -> transformAttributes -> events -> " +
              prop.toString();
          }
        });
      } else if (key.startsWith("$")) {
        results.exprs.unshift(
          t.expressionStatement(
            t.callExpression(t.identifier(key.slice(1)), [
              elem,
              t.arrowFunctionExpression([], value.expression as t.Expression)
            ])
          )
        );
      } else if (!value || checkParens(value, path)) {
        results.exprs.push(setAttrExpr(elem, key, value.expression));
      } else {
        // TODO cleanup others
        let isCall = t.isCallExpression(value.expression);
        if (!isCall && t.isIdentifier(value.expression)) {
          const decl = declarationInScope(path.scope, value.expression.name);
          if (t.isVariableDeclarator(decl)) {
            isCall = t.isCallExpression(decl.init); // attribute-compute-4
          } else {
            debugger;
          }
        }
        results.exprs.push(
          t.expressionStatement(
            isCall
              ? computeAttribute(elem, key, value.expression)
              : setAttr(elem, key, value.expression)
          )
        );
      }
    } else {
      if (key === "className") key = "class";
      results.template += ` ${key}`;
      if (value) results.template += `='${value.value}'`;
    }
  });
}

function transformChildren(path, jsx, opts, results) {
  let tempPath = results.id && results.id.name,
    i = 0;
  jsx.children.forEach((jsxChild, index) => {
    const child = generateHTMLNode(path, jsxChild, opts, {
      skipId: !results.id || !detectExpressions(jsx, index)
    });
    if (!child) return;
    results.template += child.template;
    if (child.id) {
      results.decl.push(
        t.variableDeclarator(
          child.id,
          t.memberExpression(
            t.identifier(tempPath),
            t.identifier(i === 0 ? "firstChild" : "nextSibling")
          )
        )
      );
      results.decl.push(...child.decl);
      results.exprs.push(...child.exprs);
      tempPath = child.id.name;
      i++;
    } else if (child.exprs.length) {
      if (
        (t.isJSXFragment(jsx) && checkParens(jsxChild, path)) ||
        checkLength(jsx.children)
      ) {
        let exprId = createPlaceholder(path, results, tempPath, i);
        const innerExpr = child.exprs[0];
        const methodName = t.isConditionalExpression(innerExpr)
          ? "conditional"
          : "insert";
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(globalOptions.moduleName),
                t.identifier(methodName)
              ),
              [
                results.id,
                methodName === "conditional"
                  ? t.arrowFunctionExpression([], innerExpr)
                  : innerExpr,
                t.nullLiteral(),
                exprId
              ]
            )
          )
        );
        tempPath = exprId.name;
        i++;
      } else
        results.exprs.push(
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.identifier(globalOptions.moduleName),
                t.identifier("insert")
              ),
              [results.id, child.exprs[0]]
            )
          )
        );
    }
  });
}

export function generateHTMLNode(
  path,
  jsx,
  opts,
  info = { skipId: undefined }
): GenerationResultType {
  if (t.isJSXElement(jsx)) {
    let tagName = getTagName(jsx),
      voidTag = VoidElements.indexOf(tagName) > -1;
    // if (tagName === "$") return generateFlow(jsx);
    if (tagName !== tagName.toLowerCase())
      return generateComponent(path, jsx, opts);
    let results = {
      id: undefined,
      template: `<${tagName}`,
      decl: [],
      exprs: []
    };
    if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$");
    transformAttributes(path, jsx, results);
    if (!voidTag) {
      results.template += ">";
      transformChildren(path, jsx, opts, results);
      results.template += `</${tagName}>`;
    } else results.template += "/>";
    return results;
  } else if (t.isJSXFragment(jsx)) {
    let results: GenerationResultType = { template: "", decl: [], exprs: [] };
    if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$");
    transformChildren(path, jsx, opts, results);
    return results;
  } else if (t.isJSXText(jsx)) {
    if (/^\s*$/.test(jsx.value)) return null;
    let results: GenerationResultType = {
      template: trimWhitespace(jsx.value),
      decl: [],
      exprs: []
    };
    if (!info.skipId) results.id = path.scope.generateUidIdentifier("el$");
    return results;
  } else if (t.isJSXExpressionContainer(jsx)) {
    if (!checkParens(jsx, path))
      return { exprs: [jsx.expression], template: "" };
    return {
      exprs: [t.arrowFunctionExpression([], jsx.expression as t.Expression)],
      template: ""
    };
  }
}
