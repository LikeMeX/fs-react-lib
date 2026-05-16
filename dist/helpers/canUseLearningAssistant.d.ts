import { AssistantUserMember } from '../types/learningAssistant';
/**
 * Skill Pass gate. Until JWT exposes pass info, set
 * `NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL=true` for local/dev UI.
 */
export declare function canUseLearningAssistant(userMember?: AssistantUserMember): boolean;
export declare function isFsAiApiConfigured(): boolean;
