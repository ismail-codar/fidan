import { FidanArray, FidanData } from ".";
export declare const coditionalDom: (condition: () => boolean, htmlFragment: DocumentFragment, dependencies: () => FidanData<any>[]) => (element: Element) => void;
export declare const insertToDom: (parentElement: any, index: any, itemElement: any) => void;
export declare const arrayMap: <T>(arr: FidanArray<T>, parentDom: Node & ParentNode, renderReturn: (item: any, idx?: number, isInsert?: boolean) => Node, reuseMode?: boolean) => void;
