import { AssistantUserMember, LearningMetadata, LearningModeApi } from '../types/learningAssistant';
import { AssistantUserProfile } from './assistantUserProfile';
export interface BuildLearningMetadataInput {
    userMember?: AssistantUserMember;
    courseId?: number | null;
    lessonId?: number;
    chapterId?: number;
    videoTimestamp?: number;
    actionIntent?: string;
    mode: LearningModeApi;
    lessonCompleted?: boolean;
    courseCompleted?: boolean;
    learningPathId?: string | number | null;
    learningPathName?: string | null;
    /** Merged with learning-path fields when both are set. */
    additionalContext?: Record<string, unknown> | null;
    /** Locally collected profile. Wins over JWT-derived placeholders when present. */
    profileOverride?: AssistantUserProfile | null;
}
export declare function buildLearningMetadata(input: BuildLearningMetadataInput): LearningMetadata;
