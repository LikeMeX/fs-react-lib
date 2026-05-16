"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseLearningAssistant = canUseLearningAssistant;
exports.isFsAiApiConfigured = isFsAiApiConfigured;
/**
 * Skill Pass gate. Until JWT exposes pass info, set
 * `NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL=true` for local/dev UI.
 */
function canUseLearningAssistant(userMember) {
    if (process.env.NEXT_PUBLIC_LEARNING_ASSISTANT_SHOW_FOR_ALL === 'true') {
        return true;
    }
    if (!userMember)
        return false;
    const m = userMember;
    if (m.skill_pass === true)
        return true;
    if (m.pass_type === 'skill_pass')
        return true;
    return false;
}
function isFsAiApiConfigured() {
    if (process.env.NEXT_PUBLIC_FS_AI_USE_PROXY === 'true') {
        return true;
    }
    return !!process.env.NEXT_PUBLIC_FS_AI_API_URL?.trim();
}
//# sourceMappingURL=canUseLearningAssistant.js.map