export declare const startContext: (key: string, value: any) => void;
export declare const getContextValue: (key: string, componentProps: any) => any;
export declare const injectContexts: (componentProps: any) => void;
export declare const endContext: (key: string) => void;
export declare const activateContext: (context: any) => void;
export declare const deactivateContext: (context: any) => void;
export declare const Context: (props: {
    key: string;
    value: any;
}) => any;
