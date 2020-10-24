import * as t from '@babel/types';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel-traverse/index.d.ts

declare module '@babel/types' {
	export class NodePath<T = t.Node> {
		node: T;
		traverse: any;
		scope: {
			bindings: {
				[key: string]: { path: t.NodePath<t.Node>; referencePaths: t.NodePath<t.Node>[] };
			};
		};
		parentPath: NodePath<t.Node>;
		parent: t.Node;
		additionalInfo: {
			memberExpressions?: t.MemberExpression[];
			arrayMapItems?: t.NodePath<t.Node>[];
		};
	}
}
