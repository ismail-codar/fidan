import { FidanValue } from "./f";
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanValue<T[]>, parentDom: Node & ParentNode, renderReturn: (item: any, idx?: number, isInsert?: boolean) => void) => void;
