import { useEffect } from 'react';
import { useAssistant } from '../contexts/assistantContext';

/**
 * Closes the assistant when it should no longer be visible (logout, auth route, etc.).
 * `assistant.open` is persisted in localStorage and would otherwise keep the panel open.
 */
export function useAssistantVisibilityGate(canShow: boolean) {
    const { open, setOpen } = useAssistant();

    useEffect(() => {
        if (canShow || !open) return;
        setOpen(false);
    }, [canShow, open, setOpen]);
}

/** @deprecated Use `useAssistantVisibilityGate` */
export const useAssistantLoggedInGate = useAssistantVisibilityGate;
