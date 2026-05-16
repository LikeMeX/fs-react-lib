"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSISTANT_FULL_PAGE_STORAGE_KEY = exports.ASSISTANT_HISTORY_STORAGE_KEY = void 0;
exports.listAssistantConversations = listAssistantConversations;
exports.upsertAssistantConversation = upsertAssistantConversation;
exports.removeAssistantConversation = removeAssistantConversation;
exports.readAssistantFullPagePreference = readAssistantFullPagePreference;
exports.writeAssistantFullPagePreference = writeAssistantFullPagePreference;
exports.ASSISTANT_HISTORY_STORAGE_KEY = 'fs-learn-assistant-conv-history-v1';
exports.ASSISTANT_FULL_PAGE_STORAGE_KEY = 'fs-learn-assistant-full-page-v1';
function readAll() {
    if (typeof window === 'undefined')
        return [];
    try {
        const raw = window.localStorage.getItem(exports.ASSISTANT_HISTORY_STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((e) => typeof e === 'object' &&
            e != null &&
            typeof e.id === 'string' &&
            (typeof e.courseId === 'number' ||
                e.courseId === null) &&
            (e.surface === 'enroll' ||
                e.surface === 'watch' ||
                e.surface === 'general') &&
            typeof e.title === 'string' &&
            typeof e.updatedAt === 'number');
    }
    catch {
        return [];
    }
}
function writeAll(entries) {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.setItem(exports.ASSISTANT_HISTORY_STORAGE_KEY, JSON.stringify(entries));
    }
    catch {
        /* quota / private mode */
    }
}
function listAssistantConversations(courseId, surface) {
    return readAll()
        .filter(e => e.courseId === courseId && e.surface === surface)
        .sort((a, b) => b.updatedAt - a.updatedAt);
}
function upsertAssistantConversation(entry) {
    const all = readAll();
    const now = entry.updatedAt ?? Date.now();
    const idx = all.findIndex(e => e.id === entry.id);
    const next = {
        id: entry.id,
        courseId: entry.courseId,
        surface: entry.surface,
        title: entry.title.trim() || 'บทสนทนา',
        updatedAt: now,
    };
    if (idx >= 0) {
        all[idx] = { ...all[idx], ...next };
    }
    else {
        all.push(next);
    }
    writeAll(all);
}
function removeAssistantConversation(id) {
    const all = readAll();
    const next = all.filter(e => e.id !== id);
    if (next.length !== all.length)
        writeAll(next);
}
function readAssistantFullPagePreference() {
    if (typeof window === 'undefined')
        return false;
    try {
        return window.localStorage.getItem(exports.ASSISTANT_FULL_PAGE_STORAGE_KEY) === '1';
    }
    catch {
        return false;
    }
}
function writeAssistantFullPagePreference(value) {
    if (typeof window === 'undefined')
        return;
    try {
        window.localStorage.setItem(exports.ASSISTANT_FULL_PAGE_STORAGE_KEY, value ? '1' : '0');
    }
    catch {
        /* ignore */
    }
}
//# sourceMappingURL=assistantConversationHistory.js.map