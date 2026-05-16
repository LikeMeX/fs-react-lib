import React from 'react';
import { AssistantUserMember } from '../types/learningAssistant';
export interface AssistantNavButtonProps {
    userMember?: AssistantUserMember;
    /** Optional override for entitlement check (e.g. when host app already gates). */
    canUse?: boolean;
    /** Render as a fixed floating button (bottom-right). Default: false (inline button). */
    floating?: boolean;
}
export declare const AssistantNavButton: React.FC<AssistantNavButtonProps>;
