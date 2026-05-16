import React from 'react';
import { LearningModeApi, SuggestedAction } from '../types/learningAssistant';
/** Default chips per FS AI learning mode: stable action_intent + Thai label + user message prompt. */
export declare const SUGGESTED_ACTIONS_BY_MODE: Record<LearningModeApi, SuggestedAction[]>;
export interface SuggestedActionsProps {
    mode: LearningModeApi;
    actions: SuggestedAction[];
    disabled?: boolean;
    /** First arg is the message sent to the assistant; second is metadata action_intent. */
    onSelect: (message: string, actionIntent: string) => void;
}
export declare const SuggestedActions: React.FC<SuggestedActionsProps>;
