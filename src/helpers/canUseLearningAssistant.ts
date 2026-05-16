import { AssistantUserMember } from '../types/learningAssistant';

/**
 * Skill Pass gate. Until JWT exposes pass info, set
 * `NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL=true` for local/dev UI.
 */
export function canUseLearningAssistant(userMember?: AssistantUserMember): boolean {
    if (process.env.NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL === 'true') {
        return true;
    }
    if (!userMember) return false;
    const m = userMember as Record<string, unknown>;
    if (m.skill_pass === true) return true;
    if (m.pass_type === 'skill_pass') return true;
    return false;
}

export function isFsAiApiConfigured(): boolean {
    if (process.env.NEXT_PUBLIC_FS_AI_USE_PROXY === 'true') {
        return true;
    }
    return !!process.env.NEXT_PUBLIC_FS_AI_API_URL?.trim();
}
