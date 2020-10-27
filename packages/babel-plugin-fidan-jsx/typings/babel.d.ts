import * as t from '@babel/types';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel-traverse/index.d.ts

declare module '@babel/types' {
	export class Scope {
		bindings: {
			[key: string]: { path: t.NodePath<t.Node>; referencePaths: t.NodePath<t.Node>[] };
		};
	}
	export class NodePath<T = t.Node> {
		node: T;
		traverse: any;
		scope: Scope;
		parentPath: NodePath<t.Node>;
		parent: t.Node;
		additionalInfo: {
			memberExpressions: t.MemberExpression[];
			arrayMapItems: t.NodePath<t.Node>[];
			parentArrayPath?: t.NodePath<t.VariableDeclarator>;
		};
	}
}
