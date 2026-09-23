import React from 'react';
import { LearningModeApi, SuggestedAction } from '../types/learningAssistant';
/** Default chips per FS AI learning mode: stable action_intent + Thai label + user message prompt. */
export declare const SUGGESTED_ACTIONS_BY_MODE: Record<LearningModeApi, SuggestedAction[]>;
/**
 * Chips to show. A host-pinned set always wins, so a page keeps its own chips for the whole
 * conversation (`[]` hides them). Unpinned, the stream's chips replace the mode defaults.
 */
export declare function resolveSuggestedActions(mode: LearningModeApi, fromStream: readonly SuggestedAction[], pinned?: readonly SuggestedAction[]): readonly SuggestedAction[];
export interface SuggestedActionsProps {
    mode: LearningModeApi;
    actions: readonly SuggestedAction[];
    /** Host-pinned chips; see `resolveSuggestedActions`. */
    pinned?: readonly SuggestedAction[];
    disabled?: boolean;
    /** First arg is the message sent to the assistant; second is metadata action_intent. */
    onSelect: (message: string, actionIntent: string) => void;
}
export declare const SuggestedActions: React.FC<SuggestedActionsProps>;
