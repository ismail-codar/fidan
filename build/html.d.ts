import { FidanValue } from '.';
export declare const htmlProps: {
    id: boolean;
    nodeValue: boolean;
    textContent: boolean;
    className: boolean;
    innerHTML: boolean;
    innerText: boolean;
    tabIndex: boolean;
    value: boolean;
    checked: boolean;
    disabled: boolean;
    readonly: boolean;
    contentEditable: boolean;
};
export declare const html: (literals: any, ...vars: any[]) => DocumentFragment;
export declare const arrayMap: <T>(arr: FidanValue<T[]>, parentDom: Node & ParentNode, nextElement: Element, renderCallback: (item: any, idx?: number, isInsert?: boolean) => Node, renderMode?: 'reuse' | 'reconcile') => void;
