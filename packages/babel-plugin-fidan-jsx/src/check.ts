import * as t from '@babel/types';
import { globalData } from './common';
import { declarationPathInScope } from './export-registry';

const isFidanCall = (node: t.CallExpression) => {
	return (
		t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.object) && node.callee.object.name === 'fidan'
	);
};

const isComponentCall = (path: t.NodePath<t.TaggedTemplateExpression>, expr: t.CallExpression) => {
	// TODO check if calling function returns html
	return t.isIdentifier(expr.callee) && expr.callee.name[0] === expr.callee.name[0].toUpperCase();
};

const isPathDynamic = (path: t.NodePath<t.Node>, bindingName?: string) => {
	const dynamicPaths = globalData.dynamicPaths;
	if (bindingName) {
		const declPath = declarationPathInScope(path.scope, bindingName);
		return dynamicPaths.includes(declPath);
	} else {
		return dynamicPaths.includes(path);
	}
};

const isEmptyLiteral = (literal: t.TemplateLiteral) => {
	return literal.quasis.length == 1 && literal.quasis[0].value.raw === '';
};

const dynamicArguments = (
	path: t.NodePath<any>,
	args: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder>
) => {
	return args.filter((arg, index) => {
		if (t.isIdentifier(arg)) {
			const isDynamic = isPathDynamic(path, arg.name);
			if (isDynamic) {
				return true;
			}
		} else {
			// TODO ObjectExpression vs...
			// debugger;
			return false;
		}
	});
};

const isArrayVariableDeclarator = (node: t.VariableDeclarator) => {
	return (
		t.isArrayExpression(node.init) ||
		(t.isNewExpression(node.init) && t.isIdentifier(node.init.callee) && node.init.callee.name === 'Array')
	);
};

const parentBlockStatement = (
	path: t.NodePath<t.Node>
): { parentStatement: t.BlockStatement | t.Program; bodyItemPath: t.NodePath<t.Node> } => {
	while (path && path.parentPath) {
		if (t.isBlockStatement(path.parentPath.node) || t.isProgram(path.parentPath.node)) {
			return { parentStatement: path.parentPath.node, bodyItemPath: path };
		}
		path = path.parentPath;
	}
};

const objectPropertyFromMemberExpression = (
	objectExpression: t.ObjectExpression,
	memberExpression: t.MemberExpression
): t.ObjectMethod | t.ObjectProperty | t.SpreadElement => {
	let objectProperty: t.ObjectMethod | t.ObjectProperty | t.SpreadElement = null;
	while (memberExpression) {
		if (t.isIdentifier(memberExpression.property)) {
			const memberPropertyName = memberExpression.property.name;
			objectProperty = objectExpression.properties.find((prop) => {
				if (t.isSpreadElement(prop)) {
					debugger;
				} else {
					if (t.isIdentifier(prop.key)) {
						return prop.key.name === memberPropertyName;
					} else {
						debugger;
					}
				}
				return null;
			});
		}
		if (t.isMemberExpression(memberExpression.object)) {
			memberExpression = memberExpression.object;
		} else {
			break;
		}
	}
	return objectProperty;
};

export const nonComputedCallExpression = (expr: t.CallExpression) => {
	// TODO improve this
	return (
		t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property) && expr.callee.property.name === 'map'
	);
};

export default {
	isFidanCall,
	isComponentCall,
	isPathDynamic,
	isEmptyLiteral,
	dynamicArguments,
	isArrayVariableDeclarator,
	parentBlockStatement,
	objectPropertyFromMemberExpression,
	nonComputedCallExpression
};
