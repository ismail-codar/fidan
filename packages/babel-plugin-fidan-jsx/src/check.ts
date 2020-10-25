import * as t from '@babel/types';
import generate from '@babel/generator';

const isFidanCall = (node: t.Expression) => {
	return (
		t.isCallExpression(node) &&
		t.isMemberExpression(node.callee) &&
		t.isIdentifier(node.callee.object) &&
		node.callee.object.name === 'fidan'
	);
};

const isFidanMember = (node: t.Expression) => {
	return t.isMemberExpression(node) && t.isIdentifier(node.object) && node.object.name === 'fidan';
};

const isComponentCall = (path: t.NodePath<t.TaggedTemplateExpression>, expr: t.CallExpression) => {
	// TODO check if calling function returns html
	return t.isIdentifier(expr.callee) && expr.callee.name[0] === expr.callee.name[0].toUpperCase();
};

const isFidanTaggedTemplateHtmlCallExpression = (path: t.NodePath<t.Node>) =>
	t.isTaggedTemplateExpression(path.node) &&
	t.isMemberExpression(path.node.tag) &&
	t.isIdentifier(path.node.tag.object) &&
	path.node.tag.object.name === 'fidan' &&
	t.isIdentifier(path.node.tag.property) &&
	path.node.tag.property.name === 'html';

const isEmptyLiteral = (literal: t.TemplateLiteral) => {
	return literal.quasis.length == 1 && literal.quasis[0].value.raw === '';
};

const dynamicArguments = (
	path: t.NodePath<any>,
	args: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder>
) => {
	return args.filter((arg, index) => {
		if (t.isIdentifier(arg)) {
			const isDynamic = isRequiredIdentifierFidanValAccess(path, arg);
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

export const nonComputedCallExpression = (path: t.NodePath, expr: t.CallExpression) => {
	// TODO improve this
	const dynamics = dynamicArguments(path, expr.arguments);
	if (dynamics.length === 0) {
		return true;
	}
	return (
		t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property) && expr.callee.property.name === 'map'
	);
};
const parentPathLoop = <T>(path: t.NodePath<t.Node>, check: (path: t.NodePath<t.Node>) => boolean): t.NodePath<T> => {
	while (true) {
		if (path == null || t.isProgram(path.node)) {
			return null;
		}
		if (check(path)) {
			return path as any;
		}
		path = path.parentPath;
	}

	return null;
};

const binaryExpressionItems = (expr: t.BinaryExpression, callback: (itemName: string) => void) => {
	if (t.isIdentifier(expr.left)) {
		callback(expr.left.name);
	}
	if (t.isIdentifier(expr.right)) {
		callback(expr.right.name);
	}
	if (t.isMemberExpression(expr.left)) {
		if (t.isIdentifier(expr.left.object)) {
			callback(expr.left.object.name);
		}
	}
	if (t.isMemberExpression(expr.right)) {
		if (t.isIdentifier(expr.right.object)) {
			callback(expr.right.object.name);
		}
	}
	if (t.isBinaryExpression(expr.left)) {
		binaryExpressionItems(expr.left, callback);
	}
	if (t.isBinaryExpression(expr.right)) {
		binaryExpressionItems(expr.right, callback);
	}
};

const unknownState = (path: t.NodePath<t.Node>) => {
	// debugger;
};

const isVariableDeclaratorPathUsedInView = (path: t.NodePath<t.VariableDeclarator>, id: t.Identifier) => {
	return path && path.additionalInfo !== undefined;
};

const isVariableDeclaratorPathGivenCompoentProps = (path: t.NodePath<t.VariableDeclarator>, id: t.Identifier) => {
	debugger;
	return false;
};

const isRequiredIdentifierFidanValAccess = (path: t.NodePath<t.Node>, id: t.LVal) => {
	if (t.isIdentifier(id)) {
		const bindingNodePath = path.scope.bindings[id.name].path as t.NodePath<t.VariableDeclarator>;
		return (
			isVariableDeclaratorPathUsedInView(bindingNodePath, id) ||
			isVariableDeclaratorPathGivenCompoentProps(bindingNodePath, id)
		);
	} else {
		return false;
	}
};

const isRequiredComputedExpression = (path: t.NodePath<t.VariableDeclarator | t.ObjectProperty>) => {
	const expr = t.isVariableDeclarator(path.node) ? path.node.init : path.node.value;
	let dynamics = [];
	if (t.isNewExpression(expr) || t.isCallExpression(expr)) {
		dynamics = dynamicArguments(path, expr.arguments);
	}
	if (dynamics.length || t.isBinaryExpression(expr) || t.isCallExpression(expr)) {
		return true;
	}
};

export default {
	unknownState,
	isFidanCall,
	isFidanMember,
	isComponentCall,
	isEmptyLiteral,
	dynamicArguments,
	isArrayVariableDeclarator,
	parentBlockStatement,
	objectPropertyFromMemberExpression,
	nonComputedCallExpression,
	parentPathLoop,
	isFidanTaggedTemplateHtmlCallExpression,
	binaryExpressionItems,
	isVariableDeclaratorPathUsedInView,
	isVariableDeclaratorPathGivenCompoentProps,
	isRequiredIdentifierFidanValAccess,
	isRequiredComputedExpression
};
