import { useCallback, useEffect, useState } from 'react';
import { fsAiApi } from '../services/fsAiApi';
import { LearningModeApi } from '../types/learningAssistant';

export interface UseAssistantConversationOptions {
    /** When set, skips creating a conversation and uses this id (e.g. picked from history). */
    pinnedConversationId?: string | null;
    /** Increment to discard the in-memory draft conversation (new chat). */
    sessionKey?: number;
    /** fs-ai user id from POST /users/ensure — attached to new conversations when set. */
    fsAiUserId?: string | null;
}

export function useAssistantConversation(
    _courseId: number | null,
    learningMode: LearningModeApi,
    _enabled: boolean,
    options?: UseAssistantConversationOptions
) {
    const pinned = options?.pinnedConversationId ?? null;
    const sessionKey = options?.sessionKey ?? 0;
    const fsAiUserId = options?.fsAiUserId ?? null;

    const [draftConversationId, setDraftConversationId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<Error | null>(null);

    useEffect(() => {
        setDraftConversationId(null);
        setCreateError(null);
    }, [sessionKey, pinned]);

    const conversationId = pinned ?? draftConversationId;

    const ensureConversation = useCallback(async (): Promise<string> => {
        if (pinned) return pinned;
        if (draftConversationId) return draftConversationId;

        setIsCreating(true);
        setCreateError(null);
        try {
            const res = await fsAiApi.createConversation({
                learning_mode: learningMode,
                ...(fsAiUserId ? { user_id: fsAiUserId } : {}),
            });
            setDraftConversationId(res.id);
            return res.id;
        } catch (e) {
            const err = e instanceof Error ? e : new Error('CREATE_CONVERSATION_FAILED');
            setCreateError(err);
            throw err;
        } finally {
            setIsCreating(false);
        }
    }, [pinned, draftConversationId, learningMode, fsAiUserId]);

    return {
        data: conversationId,
        ensureConversation,
        isLoading: isCreating,
        isError: createError != null,
        error: createError,
    };
}
