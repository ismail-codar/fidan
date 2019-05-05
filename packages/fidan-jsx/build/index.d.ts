export * from "./events";
export * from "./array-map";
export declare const cleanup: any;
export declare const wrap: <T>(fn: (prev?: T) => T) => void;
export declare const sample: <T>(fn: () => T) => T;
export declare const root: <T>(fn: (dispose: () => void) => T) => T;
export declare const insert: (parent: Node, accessor: any, init?: any, marker?: Node) => void;
export declare const spread: (node: HTMLElement, accessor: any) => void;
