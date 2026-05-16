import { AssistantMessage, SuggestedAction } from '../types/learningAssistant';
import { fsAiApi } from '../services/fsAiApi';
export declare function useAssistantStream(): {
    messages: AssistantMessage[];
    setMessages: import("react").Dispatch<import("react").SetStateAction<AssistantMessage[]>>;
    suggestedActions: SuggestedAction[];
    streaming: boolean;
    error: string;
    send: (conversationId: string, body: Parameters<typeof fsAiApi.buildStreamInit>[1]) => Promise<void>;
    abort: () => void;
    reset: () => void;
};
