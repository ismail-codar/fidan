declare const _default: {
    wrap<T>(fn: (prev?: T) => T): void;
    sample: <T>(fn: () => T) => T;
    root: <T>(fn: (dispose: () => void) => T) => T;
    cleanup: any;
    insert: (parent: any, accessor: any) => void;
};
export default _default;
