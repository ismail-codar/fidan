import { FidanArray } from "./f";
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanArray<T>, parentDom: Node & ParentNode, renderReturn: (item: any, idx?: number, isInsert?: boolean) => void, renderMode?: "reuse" | "reconcile") => void;
