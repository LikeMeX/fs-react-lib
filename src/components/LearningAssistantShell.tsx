import React from 'react';
import { canShowAssistant } from '../helpers/assistantAuthGate';
import { useAssistantVisibilityGate } from '../hooks/useAssistantVisibilityGate';
import { AssistantNavButton } from './AssistantNavButton';
import { AssistantPanel } from './AssistantPanel';

export interface LearningAssistantShellProps {
    pathname: string;
    children?: React.ReactNode;
    /** When true (default), user must be logged in. Set false for fs-ecommerce guest chat. */
    requireAuth?: boolean;
    isLoggedIn?: boolean;
}

/**
 * Renders global assistant UI outside auth routes.
 * Must be mounted inside `AssistantContextProvider`.
 */
export const LearningAssistantShell: React.FC<LearningAssistantShellProps> = ({
    pathname,
    children,
    requireAuth = true,
    isLoggedIn = false,
}) => {
    const assistantVisible = canShowAssistant({ pathname, requireAuth, isLoggedIn });
    useAssistantVisibilityGate(assistantVisible);

    return (
        <>
            {children}
            <AssistantNavButton floating canUse={assistantVisible} />
            <AssistantPanel surface="general" canUse={assistantVisible} />
        </>
    );
};
