import { FidanArray, FidanData } from ".";
export declare const coditionalDom: (condition: () => boolean, dependencies: () => FidanData<any>[], htmlFragment: DocumentFragment) => (parentElement: Element, nextElement: Element) => void;
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanArray<T>, parentDom: Node & ParentNode, nextElement: Element, renderCallback: (item: any, idx?: number, isInsert?: boolean) => Node, renderMode?: "reuse" | "reconcile") => void;
