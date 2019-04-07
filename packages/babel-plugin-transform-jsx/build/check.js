"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const found_1 = require("./found");
const svg_1 = require("./svg");
const specialMemberAccessKeywords = ['$val', 'freezed'];
exports.checker = {
    literalTracked: (name) => {
        return name.endsWith('$');
    }
    // commentTracked: (text: string) => {
    // 	return text.trim().startsWith(COMMENT_TRACKED);
    // },
    // commentTrackedSet: (text: string) => {
    // 	return text.trim() === COMMENT_TRACKED + '_set';
    // },
    // commentHasTrackKeys: (text: string) => {
    // 	return text.indexOf(COMMENT_TRACK_KEYS) !== -1;
    // },
    // commentHasTrackKey: (text: string, keyName: string) => {
    // 	const str = text.substr(text.indexOf(COMMENT_TRACK_KEYS) + COMMENT_TRACK_KEYS.length + 1).trim();
    // 	return str.split('|').indexOf(keyName) !== -1;
    // },
    // commentNonTracked: (text: string) => {}
};
const isTrackedByNodeName = (node) => {
    if (t.isUnaryExpression(node))
        node = node.argument;
    const nodeName = t.isIdentifier(node) || t.isJSXIdentifier(node)
        ? node.name
        : t.isStringLiteral(node)
            ? node.value
            : t.isMemberExpression(node)
                ? node.property.name
                : t.isVariableDeclarator(node) && t.isIdentifier(node.id) ? node.id.name : null;
    return nodeName && exports.checker.literalTracked(nodeName) && specialMemberAccessKeywords.indexOf(nodeName) === -1;
};
// const leadingCommentsFromPath = (path: NodePath<any>) => {
// 	let leadingComments = null;
// 	if (t.isProgram(path.parent)) {
// 		const searchName =
// 			t.isExpressionStatement(path.node) &&
// 			t.isAssignmentExpression(path.node.expression) &&
// 			t.isIdentifier(path.node.expression.left)
// 				? path.node.expression.left.name
// 				: null;
// 		if (!searchName) return null;
// 		path.parent.body.every((item) => {
// 			if (t.isVariableDeclaration(item)) {
// 				item.declarations.every((decl) => {
// 					if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id) && decl.id.name === searchName) {
// 						leadingComments = item.leadingComments;
// 					}
// 					return leadingComments === null;
// 				});
// 				return leadingComments === null;
// 			}
// 		});
// 	} else {
// 		if (path.isImportSpecifier(path.node)) {
// 			//TODO use export-sources
// 			return path.parent.trailingComments;
// 		}
// 		leadingComments = path.parent.leadingComments;
// 		if (t.isExportNamedDeclaration(path.parentPath.parent))
// 			leadingComments = path.parentPath.parent.leadingComments;
// 	}
// 	return leadingComments;
// };
// const leadingCommentsHasTracked = (leadingComments: ReadonlyArray<t.Comment>) => {
// 	if (leadingComments == null) return false;
// 	return leadingComments.find((comment) => checker.commentTracked(comment.value)) != null;
// };
// const hasTrackedComment = (path: NodePath<any>) => {
// 	let leadingComments = leadingCommentsFromPath(path);
// 	return leadingCommentsHasTracked(leadingComments);
// };
// const hasTrackedSetComment = (path: NodePath<t.Node>) => {
// 	let leadingComments = leadingCommentsFromPath(path);
// 	if (leadingComments == null) return false;
// 	return leadingComments.find((comment) => checker.commentTrackedSet(comment.value)) != null;
// };
// const hasTrackedKeyComment = (leadingComments: any[], keyName: string) => {
// 	if (!leadingComments) return false;
// 	const comment: t.Comment = leadingComments.find((item) => checker.commentHasTrackKeys(item.value));
// 	if (!comment) return false;
// 	return checker.commentHasTrackKey(comment.value, keyName);
// };
const isTrackedVariable = (scope, node) => {
    if (!node)
        return false;
    if (t.isCallExpression(node) && t.isMemberExpression(node.callee)) {
        node = node.callee.property; // condition-2
    }
    if (isTrackedByNodeName(node))
        return true;
    // if (t.isMemberExpression(node) && t.isIdentifier(node.object)) {
    // 	// var object1 = {
    // 	//   // @tracked
    // 	//   property1: 1
    // 	// };
    // 	let variableBinding = found.variableBindingInScope(scope, node.object.name);
    // 	if (
    // 		variableBinding &&
    // 		t.isVariableDeclarator(variableBinding.path.node) &&
    // 		t.isObjectExpression(variableBinding.path.node.init)
    // 	) {
    // 		const property = variableBinding.path.node.init.properties.find(
    // 			(item) => t.isObjectProperty(item) && item.key.name === node.property.name
    // 		);
    // 	}
    // }
    // let searchName = t.isIdentifier(node) ? node.name : null;
    // let variableBinding = searchName && found.variableBindingInScope(scope, searchName);
    // if (variableBinding) {
    // 	if (
    // 		t.isImportSpecifier(variableBinding.path.node) &&
    // 		isTrackedVariable(variableBinding.path.scope, variableBinding.path.node)
    // 	) {
    // 		//TODO use export-sources
    // 		return true;
    // 	} else if (
    // 		t.isVariableDeclarator(variableBinding.path.node) &&
    // 		t.isVariableDeclaration(variableBinding.path.parent) &&
    // 		isTrackedVariable(variableBinding.path.scope, variableBinding.path.node)
    // 	) {
    // 		return true;
    // 	}
    // }
    return false;
};
const isTrackedVariableDeclarator = (node) => {
    return t.isVariableDeclarator(node) && isTrackedByNodeName(node);
};
// const isTrackedKey = (scope: Scope, node: t.MemberExpression) => {
// 	const variableBinding = t.isIdentifier(node.object) ? found.variableBindingInScope(scope, node.object.name) : null;
// 	if (variableBinding && hasTrackedKeyComment(variableBinding.path.node.leadingComments, node.property.name))
// 		return true;
// };
const isFidanName = (node) => {
    const str = t.isIdentifier(node) ? node.name : node.toString();
    return str === 'React' || str.indexOf('fidan') !== -1;
};
const fidanValueBinaryInit = (
// fidan.value(a.$val + b.$val); gibi mi diye bak
expression) => {
    return (t.isCallExpression(expression) &&
        expression.arguments.length == 1 &&
        t.isBinaryExpression(expression.arguments[0]) &&
        t.isMemberExpression(expression.callee) &&
        t.isIdentifier(expression.callee.object) &&
        isFidanName(expression.callee.object.name) &&
        t.isIdentifier(expression.callee.property) &&
        expression.callee.property.name == 'value');
};
const parentPathComputeCallee = (path) => {
    if (!path.parentPath || !path.parentPath.parentPath || !path.parentPath.parentPath.parentPath)
        return false;
    const parentPath = path.parentPath.parentPath.parentPath;
    if (t.isCallExpression(parentPath.node) && t.isIdentifier(parentPath.node.callee))
        return parentPath.node.callee.name === 'fidan.compute';
    else
        return false;
};
/**
 * function (element) {
      fidan.compute... control
    }
 */
const isFidanElementFunction = (node) => {
    if (t.isFunctionExpression(node) && node.params.length === 1) {
        const param0 = node.params[0];
        if (t.isIdentifier(param0))
            return param0.name === 'element';
    }
    return false;
};
const nameIsComponent = (name) => name !== null && name.substr(0, 1).toUpperCase() == name.substr(0, 1) && !name.endsWith('_');
const expressionContainerParentIsComponent = (path) => {
    if (path.parentPath &&
        path.parentPath.parentPath &&
        t.isJSXOpeningElement(path.parentPath.parentPath.node) &&
        t.isJSXIdentifier(path.parentPath.parentPath.node.name)) {
        const name = path.parentPath.parentPath.node.name.name;
        return nameIsComponent(name);
    }
};
const objectPropertyParentIsComponent = (path) => {
    if (Array.isArray(path.parentPath.container) && path.parentPath.container.length) {
        const foundPath = found_1.found.parentPathFound(path, (checkPath) => t.isJSXOpeningElement(checkPath.node));
        if (t.isJSXIdentifier(foundPath.node.name)) {
            const name = foundPath.node.name.name;
            return nameIsComponent(name);
        }
        else if (t.isJSXMemberExpression(foundPath.node.name)) {
            const name = foundPath.node.name.property.name;
            return nameIsComponent(name);
        }
        else
            return false;
        // let name: string = null;
        // const container = path.parentPath.container[0];
        // if (t.isIdentifier(container)) name = container.name;
        // else if (t.isJSXAttribute(container)) name = container.name.name.toString();
    }
    while (path) {
        if (t.isCallExpression(path.node) &&
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object) &&
            isFidanName(path.node.callee.object.name) &&
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'createElement') {
            const arg0 = path.node.arguments[0];
            return (t.isIdentifier(arg0) &&
                arg0.name.substr(0, 1).toUpperCase() == arg0.name.substr(0, 1) &&
                !arg0.name.endsWith('_'));
        }
        else
            path = path.parentPath;
    }
    return false;
};
const isExportsMember = (expression) => {
    if (t.isMemberExpression(expression) && t.isIdentifier(expression.object) && expression.object.name === 'exports')
        return true;
};
const isValMemberProperty = (node) => {
    if (t.isMemberExpression(node)) {
        return t.isIdentifier(node.property)
            ? node.property.name === '$val'
            : t.isStringLiteral(node.property) ? node.property.value === '$val' : false;
    }
    return false;
};
const isComputeReturnExpression = (node) => {
    return (t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.property) &&
        node.callee.property.name === 'computeReturn');
};
const isArrayMapExpression = (scope, expression) => {
    return (t.isMemberExpression(expression.callee) &&
        expression.callee.property.name == 'map' &&
        (exports.check.isValMemberProperty(expression.callee.object) ||
            exports.check.isTrackedVariable(scope, expression.callee.object)));
};
const isFidanCall = (node) => {
    if (!t.isCallExpression(node))
        return false;
    if (t.isIdentifier(node.callee))
        return isFidanName(node.callee);
    const member = found_1.found.callMemberExpressionCheck(node, (memberExpression) => {
        return (isFidanName(memberExpression.property) ||
            (t.isIdentifier(memberExpression.object) && isFidanName(memberExpression.object.name)));
    });
    return member != null;
};
const isDynamicExpression = (expression) => t.isBinaryExpression(expression) ||
    t.isLogicalExpression(expression) ||
    t.isConditionalExpression(expression) ||
    (t.isCallExpression(expression) &&
        !(t.isMemberExpression(expression.callee) &&
            t.isIdentifier(expression.callee.object) &&
            isFidanName(expression.callee.object.name)));
const isSvgElementTagName = (tagName, openedTags) => {
    return ((tagName != null && svg_1.allSvgElements.indexOf(tagName) !== -1) ||
        (svg_1.htmlAndSvgElements.indexOf(tagName) !== -1 && svg_1.allSvgElements.indexOf(openedTags[openedTags.length - 1]) !== -1));
};
const isClassPropertyLike = (path, expression) => {
    if (t.isMemberExpression(expression.left)) {
        if (expression.left.object.type === 'ThisExpression') {
            if (path.parentPath.parentPath) {
                const parentPropPath = path.parentPath.parentPath.parentPath;
                if (parentPropPath && t.isObjectProperty(parentPropPath.node)) {
                    const parentParentPropPath = parentPropPath.parentPath &&
                        parentPropPath.parentPath.parentPath &&
                        parentPropPath.parentPath.parentPath.parentPath;
                    if (parentParentPropPath &&
                        t.isCallExpression(parentParentPropPath.node) &&
                        t.isIdentifier(parentParentPropPath.node.callee)) {
                        return parentParentPropPath.node.callee.name === '_createClass';
                    }
                }
                else {
                    return false;
                }
            }
        }
    }
    return true;
};
exports.check = {
    isFidanName,
    isFidanCall,
    isValMemberProperty,
    isTrackedVariableDeclarator,
    isComputeReturnExpression,
    // hasTrackedComment,
    // hasTrackedSetComment,
    // hasTrackedKeyComment,
    // isTrackedKey,
    isTrackedVariable,
    specialMemberAccessKeywords,
    fidanValueBinaryInit,
    parentPathComputeCallee,
    nameIsComponent,
    expressionContainerParentIsComponent,
    objectPropertyParentIsComponent,
    isExportsMember,
    isArrayMapExpression,
    isDynamicExpression,
    isSvgElementTagName,
    isFidanElementFunction,
    isClassPropertyLike
};
//# sourceMappingURL=check.js.map