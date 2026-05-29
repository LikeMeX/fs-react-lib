import React from 'react';
import { canShowAssistant } from '../helpers/assistantAuthGate';
import { useAssistantVisibilityGate } from '../hooks/useAssistantVisibilityGate';
import { AssistantUserMember } from '../types/learningAssistant';
import { AssistantNavButton } from './AssistantNavButton';
import { AssistantPanel } from './AssistantPanel';

export interface LearningAssistantShellProps {
    pathname: string;
    children?: React.ReactNode;
    /** When true (default), user must be logged in. Set false for fs-ecommerce guest chat. */
    requireAuth?: boolean;
    isLoggedIn?: boolean;
    /** Decoded JWT / member profile for SkillPass ensure + metadata. */
    userMember?: AssistantUserMember;
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
    userMember,
}) => {
    const assistantVisible = canShowAssistant({ pathname, requireAuth, isLoggedIn });
    useAssistantVisibilityGate(assistantVisible);

    return (
        <>
            {children}
            <AssistantNavButton floating canUse={assistantVisible} userMember={userMember} />
            <AssistantPanel surface="general" canUse={assistantVisible} userMember={userMember} />
        </>
    );
};
