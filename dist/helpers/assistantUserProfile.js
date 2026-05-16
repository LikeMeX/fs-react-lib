"use strict";
/** Persists assistant personalization profile in localStorage. Survives reloads, scoped per browser. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAssistantUserProfile = readAssistantUserProfile;
exports.writeAssistantUserProfile = writeAssistantUserProfile;
exports.clearAssistantUserProfile = clearAssistantUserProfile;
exports.isAssistantUserProfileComplete = isAssistantUserProfileComplete;
const STORAGE_KEY = 'assistant.user_profile.v1';
const REQUIRED_FIELDS = [
    'current_job',
    'target_job',
    'industry',
    'timeframe',
];
function readAssistantUserProfile() {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object')
            return null;
        return {
            current_job: String(parsed.current_job ?? '').trim(),
            target_job: String(parsed.target_job ?? '').trim(),
            industry: String(parsed.industry ?? '').trim(),
            timeframe: String(parsed.timeframe ?? '').trim(),
            ...(parsed.skill_level ? { skill_level: String(parsed.skill_level).trim() } : {}),
        };
    }
    catch {
        return null;
    }
}
function writeAssistantUserProfile(profile) {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    catch {
        /* ignore quota / privacy mode */
    }
}
function clearAssistantUserProfile() {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        /* ignore */
    }
}
function isAssistantUserProfileComplete(profile) {
    if (!profile)
        return false;
    return REQUIRED_FIELDS.every(k => {
        const v = profile[k];
        return typeof v === 'string' && v.trim().length > 0;
    });
}
//# sourceMappingURL=assistantUserProfile.js.map