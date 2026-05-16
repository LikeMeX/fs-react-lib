import { AssistantUiPhase, LearningModeApi } from '../types/learningAssistant';
export interface UseAssistantPhaseArgs {
    route: 'enroll' | 'watch' | 'general';
    conversationId: string | null;
    courseId: number | null;
    lessonId?: number | null;
    chapterId?: number | null;
    lessonComplete: boolean;
    courseComplete: boolean;
    enabled: boolean;
    /** When set, overrides auto-derived mode (user-picked from ModePicker). */
    overrideMode?: LearningModeApi | null;
}
export declare function useAssistantPhase(args: UseAssistantPhaseArgs): {
    phase: AssistantUiPhase;
    apiMode: LearningModeApi;
    lastError: string;
};
