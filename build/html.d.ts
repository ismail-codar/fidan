import { FidanValue } from "./f";
export declare const html: (...args: any[]) => DocumentFragment;
export declare const htmlArrayMap: (arr: any[] | FidanValue<any[]>, renderCallback: (data: number) => any, useCloneNode?: boolean) => (commentNode: Node) => void;
