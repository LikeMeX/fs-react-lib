import { useQuery } from '@tanstack/react-query';
import { fsAiApi } from '../services/fsAiApi';
import { LearningModeApi } from '../types/learningAssistant';

export interface UseAssistantConversationOptions {
    /** When set, skips creating a conversation and uses this id (e.g. picked from local history). */
    pinnedConversationId: string | null;
    /** Increment to force a new server conversation (new chat). */
    sessionKey: number;
    /** fs-ai user id from POST /users/ensure — attached to new conversations when set. */
    fsAiUserId?: string | null;
}

export function useAssistantConversation(
    courseId: number | null,
    initialMode: LearningModeApi,
    enabled: boolean,
    options?: UseAssistantConversationOptions
) {
    const pinned = options?.pinnedConversationId ?? null;
    const sessionKey = options?.sessionKey ?? 0;
    const fsAiUserId = options?.fsAiUserId ?? null;

    const query = useQuery({
        queryKey: ['fs-ai-conversation', courseId ?? 'none', initialMode, sessionKey, fsAiUserId],
        queryFn: async () => {
            const res = await fsAiApi.createConversation({
                learning_mode: initialMode,
                ...(fsAiUserId ? { user_id: fsAiUserId } : {}),
            });
            return res.id;
        },
        enabled: Boolean(enabled && !pinned),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const conversationId = pinned ?? query.data ?? null;

    return {
        ...query,
        data: conversationId,
        isLoading: pinned ? false : query.isLoading,
        isError: pinned ? false : query.isError,
    };
}
