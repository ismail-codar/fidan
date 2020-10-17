import * as t from '@babel/types';

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel-traverse/index.d.ts

declare module '@babel/types' {
	export class NodePath<T = t.Node> {
		node: T;
		traverse: any;
		scope: any;
		parentPath: NodePath<t.Node>;
		parent: t.Node;
		additionalInfo: {
			memberExpressions?: t.MemberExpression[];
			arrayMapItems?: t.NodePath<t.Node>[];
		};
	}
}
