import React from 'react';
import { AssistantSurface } from '../helpers/assistantConversationHistory';
import { AssistantUserMember, LearningModeApi } from '../types/learningAssistant';
export interface AssistantPanelProps {
    /** 'general' = no course context. 'enroll'/'watch' for course-bound flows. */
    surface?: AssistantSurface;
    courseId?: number | null;
    lessonId?: number | null;
    chapterId?: number | null;
    lessonComplete?: boolean;
    courseComplete?: boolean;
    /** Allowed modes. Default ['general']. ModePicker shown only when length > 1. */
    modes?: LearningModeApi[];
    /** Host app user / decoded JWT. Used by buildLearningMetadata and entitlement gate. */
    userMember?: AssistantUserMember;
    /** Override entitlement check. */
    canUse?: boolean;
    /** Called when sending a message; return current player time in seconds (watch only). */
    getVideoTimestamp?: () => number;
}
export declare const AssistantPanel: React.FC<AssistantPanelProps>;
