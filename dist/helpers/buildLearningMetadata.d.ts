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
    /** Locally collected profile. Wins over JWT-derived placeholders when present. */
    profileOverride?: AssistantUserProfile | null;
}
export declare function buildLearningMetadata(input: BuildLearningMetadataInput): LearningMetadata;
//# sourceMappingURL=buildLearningMetadata.d.ts.map