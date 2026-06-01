import type { ConversationOut, LearningModeApi } from '../types/learningAssistant';
import type { AssistantHistoryEntry, AssistantSurface } from './assistantConversationHistory';

export function previewConversationTitle(text: string, max = 72): string {
    const t = text.trim().replace(/\s+/g, ' ');
    if (!t) return 'บทสนทนา';
    return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function learningModeToSurface(mode: LearningModeApi | undefined): AssistantSurface {
    if (mode === 'before_class') return 'enroll';
    if (mode === 'during_class' || mode === 'after_class') return 'watch';
    return 'general';
}

/** Map fs-ai conversation list item to UI history row (user-scoped, not filtered by surface). */
export function mapApiConversationToHistoryEntry(conv: ConversationOut): AssistantHistoryEntry {
    const updatedAt = conv.updated_at ? new Date(conv.updated_at).getTime() : Date.now();
    const title = (conv.title || '').trim() || 'บทสนทนา';
    return {
        id: String(conv.id),
        courseId: null,
        surface: learningModeToSurface(conv.mode ?? conv.learning_mode),
        title,
        updatedAt,
    };
}
