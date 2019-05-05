import { FidanArray } from "@fidanjs/runtime";
export declare const jsxArrayMap: <T>(arr: FidanArray<T[]>, renderCallback: (data: T) => DocumentFragment, renderMode?: "reuse" | "reconcile") => (parentElement: any) => void;
