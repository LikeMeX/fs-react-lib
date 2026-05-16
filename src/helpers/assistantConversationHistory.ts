export const ASSISTANT_HISTORY_STORAGE_KEY = 'fs-learn-assistant-conv-history-v1';
export const ASSISTANT_FULL_PAGE_STORAGE_KEY = 'fs-learn-assistant-full-page-v1';

export type AssistantSurface = 'enroll' | 'watch' | 'general';

export interface AssistantHistoryEntry {
    id: string;
    courseId: number | null;
    surface: AssistantSurface;
    title: string;
    updatedAt: number;
}

function readAll(): AssistantHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(ASSISTANT_HISTORY_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (e): e is AssistantHistoryEntry =>
                typeof e === 'object' &&
                e != null &&
                typeof (e as AssistantHistoryEntry).id === 'string' &&
                (typeof (e as AssistantHistoryEntry).courseId === 'number' ||
                    (e as AssistantHistoryEntry).courseId === null) &&
                ((e as AssistantHistoryEntry).surface === 'enroll' ||
                    (e as AssistantHistoryEntry).surface === 'watch' ||
                    (e as AssistantHistoryEntry).surface === 'general') &&
                typeof (e as AssistantHistoryEntry).title === 'string' &&
                typeof (e as AssistantHistoryEntry).updatedAt === 'number'
        );
    } catch {
        return [];
    }
}

function writeAll(entries: AssistantHistoryEntry[]) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(ASSISTANT_HISTORY_STORAGE_KEY, JSON.stringify(entries));
    } catch {
        /* quota / private mode */
    }
}

export function listAssistantConversations(
    courseId: number | null,
    surface: AssistantSurface
): AssistantHistoryEntry[] {
    return readAll()
        .filter(e => e.courseId === courseId && e.surface === surface)
        .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertAssistantConversation(entry: {
    id: string;
    courseId: number | null;
    surface: AssistantSurface;
    title: string;
    updatedAt?: number;
}) {
    const all = readAll();
    const now = entry.updatedAt ?? Date.now();
    const idx = all.findIndex(e => e.id === entry.id);
    const next: AssistantHistoryEntry = {
        id: entry.id,
        courseId: entry.courseId,
        surface: entry.surface,
        title: entry.title.trim() || 'บทสนทนา',
        updatedAt: now,
    };
    if (idx >= 0) {
        all[idx] = { ...all[idx], ...next };
    } else {
        all.push(next);
    }
    writeAll(all);
}

export function removeAssistantConversation(id: string) {
    const all = readAll();
    const next = all.filter(e => e.id !== id);
    if (next.length !== all.length) writeAll(next);
}

export function readAssistantFullPagePreference(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(ASSISTANT_FULL_PAGE_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function writeAssistantFullPagePreference(value: boolean) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(ASSISTANT_FULL_PAGE_STORAGE_KEY, value ? '1' : '0');
    } catch {
        /* ignore */
    }
}
