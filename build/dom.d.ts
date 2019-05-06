import { FidanValue } from ".";
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanValue<T[]>, parentDom: Node & ParentNode, nextElement: Element, renderCallback: (item: any, idx?: number, isInsert?: boolean) => Node, renderMode?: "reuse" | "reconcile") => void;
