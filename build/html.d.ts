import { FidanArray } from "./f";
export declare const html: (...args: any[]) => DocumentFragment;
export declare const htmlArrayMap: <T>(arr: FidanArray<T>, renderCallback: (data: T) => DocumentFragment, options?: {
    useCloneNode: boolean;
    reuseMode?: boolean;
}) => (commentNode: Node) => void;
