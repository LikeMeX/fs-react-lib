import { LearningModeApi } from '../types/learningAssistant';
export interface UseAssistantConversationOptions {
    /** When set, skips creating a conversation and uses this id (e.g. picked from history). */
    pinnedConversationId?: string | null;
    /** Increment to discard the in-memory draft conversation (new chat). */
    sessionKey?: number;
    /** fs-ai user id from POST /users/ensure — attached to new conversations when set. */
    fsAiUserId?: string | null;
}
export declare function useAssistantConversation(_courseId: number | null, learningMode: LearningModeApi, _enabled: boolean, options?: UseAssistantConversationOptions): {
    data: string;
    ensureConversation: () => Promise<string>;
    isLoading: boolean;
    isError: boolean;
    error: Error;
};
