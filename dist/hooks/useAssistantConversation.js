"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssistantConversation = useAssistantConversation;
const react_1 = require("react");
const fsAiApi_1 = require("../services/fsAiApi");
function useAssistantConversation(_courseId, learningMode, _enabled, options) {
    const pinned = options?.pinnedConversationId ?? null;
    const sessionKey = options?.sessionKey ?? 0;
    const fsAiUserId = options?.fsAiUserId ?? null;
    const [draftConversationId, setDraftConversationId] = (0, react_1.useState)(null);
    const [isCreating, setIsCreating] = (0, react_1.useState)(false);
    const [createError, setCreateError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        setDraftConversationId(null);
        setCreateError(null);
    }, [sessionKey, pinned]);
    const conversationId = pinned ?? draftConversationId;
    const ensureConversation = (0, react_1.useCallback)(async () => {
        if (pinned)
            return pinned;
        if (draftConversationId)
            return draftConversationId;
        setIsCreating(true);
        setCreateError(null);
        try {
            const res = await fsAiApi_1.fsAiApi.createConversation({
                learning_mode: learningMode,
                ...(fsAiUserId ? { user_id: fsAiUserId } : {}),
            });
            setDraftConversationId(res.id);
            return res.id;
        }
        catch (e) {
            const err = e instanceof Error ? e : new Error('CREATE_CONVERSATION_FAILED');
            setCreateError(err);
            throw err;
        }
        finally {
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
