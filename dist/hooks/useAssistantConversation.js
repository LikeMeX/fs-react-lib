"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssistantConversation = useAssistantConversation;
const react_query_1 = require("@tanstack/react-query");
const fsAiApi_1 = require("../services/fsAiApi");
function useAssistantConversation(courseId, initialMode, enabled, options) {
    const pinned = options?.pinnedConversationId ?? null;
    const sessionKey = options?.sessionKey ?? 0;
    const query = (0, react_query_1.useQuery)({
        queryKey: ['fs-ai-conversation', courseId ?? 'none', initialMode, sessionKey],
        queryFn: async () => {
            const res = await fsAiApi_1.fsAiApi.createConversation({
                learning_mode: initialMode,
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
