export declare const ASSISTANT_HISTORY_STORAGE_KEY = "fs-learn-assistant-conv-history-v1";
export declare const ASSISTANT_FULL_PAGE_STORAGE_KEY = "fs-learn-assistant-full-page-v1";
export type AssistantSurface = 'enroll' | 'watch' | 'general';
export interface AssistantHistoryEntry {
    id: string;
    courseId: number | null;
    surface: AssistantSurface;
    title: string;
    updatedAt: number;
}
export declare function listAssistantConversations(courseId: number | null, surface: AssistantSurface): AssistantHistoryEntry[];
export declare function upsertAssistantConversation(entry: {
    id: string;
    courseId: number | null;
    surface: AssistantSurface;
    title: string;
    updatedAt?: number;
}): void;
export declare function removeAssistantConversation(id: string): void;
export declare function readAssistantFullPagePreference(): boolean;
export declare function writeAssistantFullPagePreference(value: boolean): void;
//# sourceMappingURL=assistantConversationHistory.d.ts.map