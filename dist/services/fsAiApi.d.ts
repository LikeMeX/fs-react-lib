import { ConversationOut, CreateConversationBody, CreateConversationResponse, PatchLearningModeBody, SendStreamBody } from '../types/learningAssistant';
export declare function configureFsAi(opts: {
    getToken: () => string | null | undefined;
}): void;
export declare const fsAiApi: {
    createConversation(body: CreateConversationBody): Promise<CreateConversationResponse>;
    getConversation(conversationId: string): Promise<ConversationOut>;
    patchLearningMode(conversationId: string, body: PatchLearningModeBody): Promise<void>;
    streamMessagesUrl(conversationId: string): string;
    buildStreamInit(_conversationId: string, body: SendStreamBody): RequestInit;
};
