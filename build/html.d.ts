import { FidanValue } from ".";
export declare const html: (...args: any[]) => DocumentFragment;
export declare const htmlArrayMap: <T>(arr: FidanValue<T[]>, renderCallback: (data: T) => DocumentFragment, options?: {
    useCloneNode: boolean;
    renderMode?: "reuse" | "reconcile";
}) => (parentElement: Element, nextElement: Element) => void;
