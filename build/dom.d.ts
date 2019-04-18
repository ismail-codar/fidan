import { FidanArray } from ".";
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanArray<T>, parentDom: Node & ParentNode, renderReturn: (item: any, idx?: number, isInsert?: boolean) => Node, reuseMode?: boolean) => void;
