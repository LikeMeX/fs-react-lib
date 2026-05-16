import React, { PropsWithChildren } from 'react';
export interface IAssistantContext {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
}
export declare const AssistantContext: React.Context<IAssistantContext>;
export declare const AssistantContextProvider: React.FC<PropsWithChildren<unknown>>;
export declare const useAssistant: () => IAssistantContext;
export default AssistantContextProvider;
//# sourceMappingURL=assistantContext.d.ts.map