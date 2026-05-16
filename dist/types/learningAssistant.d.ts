/** Learning assistant ↔ FS AI API (REST + SSE). Shapes align with backend contract; extend as OpenAPI evolves. */
export type LearningModeApi = 'before_class' | 'during_class' | 'after_class' | 'general' | 'apply';
export type AssistantUiPhase = 'before' | 'during' | 'after';
export interface SuggestedAction {
    action_intent: string;
    label?: string;
    label_th?: string;
    /** When set, this text is sent as the user message (preferred over raw action_intent). */
    prompt?: string;
    description?: string;
}
/** FS AI stream metadata. IDs MUST nest under learning_state — backend LearningState model. */
export interface LearningMetadata {
    user_profile: {
        current_job: string;
        target_job: string;
        industry: string;
        timeframe: string;
        skill_level?: string;
    };
    learning_state: {
        mode: string;
        /** API accepts string IDs */
        course_id?: string;
        lesson_id?: string;
        chapter_id?: string;
        video_timestamp?: number;
        course_completed?: boolean;
        lesson_completed?: boolean;
    };
    action_intent?: string;
    pass_type?: string;
}
export interface AssistantMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: {
        title?: string;
        url?: string;
    }[];
}
export interface StreamMetaPayload {
    message_id?: string;
    sources?: {
        title?: string;
        url?: string;
    }[];
    suggested_actions?: SuggestedAction[];
}
export interface CreateConversationBody {
    /** Backend `CreateConversationIn` uses `learning_mode`. `course_id` not in contract. */
    learning_mode?: LearningModeApi;
    title?: string;
}
export interface CreateConversationResponse {
    id: string;
}
export interface PatchLearningModeBody {
    mode: LearningModeApi;
    course_id: number;
    lesson_id?: number;
    chapter_id?: number;
}
export interface SendStreamBody {
    /** FS AI expects `message`, not `content`. */
    message: string;
    metadata: LearningMetadata;
}
/** Backend MessageOut. `sources` is loosely typed; UI filters/normalizes downstream. */
export interface MessageOut {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: {
        title?: string;
        url?: string;
    }[];
    created_at?: string;
}
export interface ConversationOut {
    id: string;
    mode?: LearningModeApi;
    messages: MessageOut[];
}
/** Opaque user-token type. Apps may pass their own decoded JWT object. */
export type AssistantUserMember = Record<string, unknown> | null | undefined;
