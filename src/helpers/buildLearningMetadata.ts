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

const UNSPECIFIED = 'unspecified';

/** Backend enum (FS AI). Unknown values are coerced to `free_chat` to avoid 422. */
const ALLOWED_ACTION_INTENTS = new Set<string>([
    'road_map_maker',
    'pre_read_primer',
    'question_starter',
    'skill_gap_scan',
    'study_planner',
    'concept_translator',
    'analogy_builder',
    'deep_dive',
    'example_generator',
    'visualizer',
    'compare_contrast',
    'jargon_decoder',
    'summary_maker',
    'flashcard_factory',
    'quiz_me',
    'mind_map_builder',
    'feynman_test',
    'spaced_review',
    'project_launcher',
    'case_study_solver',
    'interview_prep',
    'portfolio_builder',
    'teach_back',
    'free_chat',
]);

function normalizeActionIntent(raw?: string): string | undefined {
    if (!raw?.trim()) return undefined;
    const v = raw.trim().toLowerCase();
    return ALLOWED_ACTION_INTENTS.has(v) ? v : 'free_chat';
}

function pickProfileField(user: AssistantUserMember, keys: string[]): string | undefined {
    if (!user) return undefined;
    const u = user as Record<string, unknown>;
    for (const k of keys) {
        const v = u[k];
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
}

export function buildLearningMetadata(input: BuildLearningMetadataInput): LearningMetadata {
    const {
        userMember,
        courseId,
        lessonId,
        chapterId,
        videoTimestamp,
        actionIntent,
        mode,
        lessonCompleted,
        courseCompleted,
        profileOverride,
    } = input;

    const passFromToken = (userMember as Record<string, unknown> | undefined | null)?.pass_type as
        | string
        | undefined;

    const currentJob =
        profileOverride?.current_job?.trim() ||
        pickProfileField(userMember, ['jobTitle', 'position', 'firstName']) ||
        UNSPECIFIED;
    const targetJob =
        profileOverride?.target_job?.trim() ||
        pickProfileField(userMember, ['target_role', 'targetRole']) ||
        UNSPECIFIED;
    const industry =
        profileOverride?.industry?.trim() ||
        pickProfileField(userMember, ['industry', 'company']) ||
        UNSPECIFIED;
    const timeframe =
        profileOverride?.timeframe?.trim() ||
        pickProfileField(userMember, ['timeframe', 'studyTimeframe']) ||
        UNSPECIFIED;
    const skillLevel = profileOverride?.skill_level?.trim();

    const meta: LearningMetadata = {
        action_intent: normalizeActionIntent(actionIntent) ?? 'free_chat',
        ...(passFromToken ? { pass_type: passFromToken } : {}),
        user_profile: {
            current_job: currentJob,
            target_job: targetJob,
            industry,
            timeframe,
            ...(skillLevel ? { skill_level: skillLevel } : {}),
        },
        learning_state: {
            mode,
            ...(courseId != null ? { course_id: String(courseId) } : {}),
            ...(lessonId != null ? { lesson_id: String(lessonId) } : {}),
            ...(chapterId != null ? { chapter_id: String(chapterId) } : {}),
            ...(videoTimestamp != null ? { video_timestamp: videoTimestamp } : {}),
            lesson_completed: lessonCompleted ?? false,
            course_completed: courseCompleted ?? false,
        },
    };

    return meta;
}
