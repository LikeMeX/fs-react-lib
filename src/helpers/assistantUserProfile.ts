/** Persists assistant personalization profile in localStorage. Survives reloads, scoped per browser. */

const STORAGE_KEY = 'assistant.user_profile.v1';

export interface AssistantUserProfile {
    current_job: string;
    target_job: string;
    industry: string;
    timeframe: string;
    skill_level?: string;
}

const REQUIRED_FIELDS: (keyof AssistantUserProfile)[] = [
    'current_job',
    'target_job',
    'industry',
    'timeframe',
];

export function readAssistantUserProfile(): AssistantUserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<AssistantUserProfile>;
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            current_job: String(parsed.current_job ?? '').trim(),
            target_job: String(parsed.target_job ?? '').trim(),
            industry: String(parsed.industry ?? '').trim(),
            timeframe: String(parsed.timeframe ?? '').trim(),
            ...(parsed.skill_level ? { skill_level: String(parsed.skill_level).trim() } : {}),
        };
    } catch {
        return null;
    }
}

export function writeAssistantUserProfile(profile: AssistantUserProfile): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
        /* ignore quota / privacy mode */
    }
}

export function clearAssistantUserProfile(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

export function isAssistantUserProfileComplete(profile: AssistantUserProfile | null): boolean {
    if (!profile) return false;
    return REQUIRED_FIELDS.every(k => {
        const v = profile[k];
        return typeof v === 'string' && v.trim().length > 0;
    });
}
