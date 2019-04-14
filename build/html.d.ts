import { FidanValue } from "./f";
export declare const html: (...args: any[]) => DocumentFragment;
export declare const htmlArrayMap: <T>(arr: FidanValue<T[]>, renderCallback: (data: T) => DocumentFragment, useCloneNode?: boolean) => (commentNode: Node) => void;
