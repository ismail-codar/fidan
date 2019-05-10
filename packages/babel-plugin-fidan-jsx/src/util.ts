import * as t from "@babel/types";
import { globalOptions } from ".";
import { Scope, Binding } from "babel-traverse";
import VoidElements from "./constants/VoidElements";
import { allSvgElements, htmlAndSvgElements } from "./svg";
import generate from "@babel/generator";

export const generateCode = node => {
  return generate(node).code;
};

export function getTagName(tag) {
  if (t.isJSXMemberExpression(tag.openingElement.name)) {
    return `${tag.openingElement.name.object.name}.${
      tag.openingElement.name.property.name
    }`;
  } else if (t.isJSXIdentifier(tag.openingElement.name)) {
    return tag.openingElement.name.name;
  }
}

export function checkParens(jsx, path) {
  const e = path.hub.file.code.slice(jsx.start + 1, jsx.end - 1).trim();
  return e[0] === "(" && e[e.length - 1] === ")";
}

export function toEventName(name) {
  name = name.slice(2).toLowerCase();
  if (name === "doubleclick") name = "dblclick";
  return name;
}

export function trimWhitespace(text) {
  return text
    .split("\n")
    .map((t, i) => {
      if (/^\s*$/.test(t)) return "";
      if (i === 0) return t.replace(/\s+/g, " ");
      return t.replace(/^\s+/g, "").replace(/\s+/g, " ");
    })
    .join("");
}

export function checkLength(children) {
  let i = 0;
  children.forEach(child => {
    if (!t.isJSXText(child) || !/^\s*$/.test(child.value)) i++;
  });
  return i > 1;
}

// reduce unnecessary refs
export function detectExpressions(jsx, index) {
  for (let i = index; i < jsx.children.length; i++) {
    if (t.isJSXExpressionContainer(jsx.children[i])) return true;
    if (t.isJSXElement(jsx.children[i])) {
      const tagName = getTagName(jsx.children[i]);
      if (tagName.toLowerCase() !== tagName) return true;
      if (
        jsx.children[i].openingElement.attributes.some(
          attr =>
            t.isJSXSpreadAttribute(attr) ||
            t.isJSXExpressionContainer(attr.value)
        )
      )
        return true;
      if (jsx.children[i].children.length)
        if (detectExpressions(jsx.children[i], 0)) return true;
    }
  }
}

export const insertFidanImport = (body: t.BaseNode[]) => {
  body.splice(
    0,
    0,
    t.variableDeclaration("var", [
      t.variableDeclarator(
        t.identifier(globalOptions.moduleName),
        t.callExpression(t.identifier("require"), [
          t.stringLiteral("@fidanjs/jsx")
        ])
      )
    ])
  );
};

export const isComponentNode = (id: t.Expression) => {
  let tagName = t.isIdentifier(id)
    ? id.name
    : t.isMemberExpression(id)
    ? t.isIdentifier(id.property)
      ? id.property.name
      : id.property
    : null;
  return isComponentName(tagName);
};

export const isComponentTag = jsx => {
  let tagName = getTagName(jsx);
  return isComponentName(tagName);
};

export const isComponentName = tagName =>
  tagName.substr(0, 1) !== tagName.substr(0, 1).toLowerCase();

export const canBeReactive = (
  value: t.Expression
): value is t.CallExpression => {
  const reactive =
    t.isCallExpression(value) &&
    value.arguments.length == 0 &&
    !isComponentNode(value.callee);
  return reactive;
};

export const isSvgElementTagName = tagName => {
  const openedTags = globalOptions.openedTags;
  return (
    (tagName != null && allSvgElements.indexOf(tagName) !== -1) ||
    (htmlAndSvgElements.indexOf(tagName) !== -1 &&
      allSvgElements.indexOf(openedTags[openedTags.length - 1]) !== -1)
  );
};
