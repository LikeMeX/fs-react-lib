import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface IAssistantContext {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
}

export const AssistantContext = createContext<IAssistantContext>({
    open: false,
    setOpen: () => undefined,
    toggle: () => undefined,
});

const OPEN_PREF_KEY = 'assistant.open';

export const AssistantContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    const [open, setOpenState] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const v = window.localStorage.getItem(OPEN_PREF_KEY);
            setOpenState(v === null ? true : v === 'true');
        } catch {
            setOpenState(true);
        }
    }, []);

    const persist = useCallback((next: boolean) => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(OPEN_PREF_KEY, String(next));
        } catch {
            /* ignore */
        }
    }, []);

    const setOpen = useCallback(
        (next: boolean) => {
            setOpenState(next);
            persist(next);
        },
        [persist]
    );

    const toggle = useCallback(() => {
        setOpenState(v => {
            const next = !v;
            persist(next);
            return next;
        });
    }, [persist]);

    const value = useMemo<IAssistantContext>(() => ({ open, setOpen, toggle }), [open, setOpen, toggle]);
    return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = () => useContext(AssistantContext);

export default AssistantContextProvider;
