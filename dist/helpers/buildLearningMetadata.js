"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLearningMetadata = buildLearningMetadata;
const UNSPECIFIED = 'unspecified';
/** Backend enum (FS AI). Unknown values are coerced to `free_chat` to avoid 422. */
const ALLOWED_ACTION_INTENTS = new Set([
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
function normalizeActionIntent(raw) {
    if (!raw?.trim())
        return undefined;
    const v = raw.trim().toLowerCase();
    return ALLOWED_ACTION_INTENTS.has(v) ? v : 'free_chat';
}
function buildAdditionalContext(input) {
    const merged = { ...(input.additionalContext ?? {}) };
    if (input.learningPathId != null && String(input.learningPathId).trim()) {
        merged.learning_path_id = String(input.learningPathId);
    }
    const lpName = input.learningPathName?.trim();
    if (lpName) {
        merged.learning_path_name = lpName;
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
}
function pickProfileField(user, keys) {
    if (!user)
        return undefined;
    const u = user;
    for (const k of keys) {
        const v = u[k];
        if (typeof v === 'string' && v.trim())
            return v.trim();
    }
    return undefined;
}
function buildLearningMetadata(input) {
    const { userMember, courseId, lessonId, chapterId, videoTimestamp, actionIntent, mode, lessonCompleted, courseCompleted, profileOverride, learningPathId, learningPathName, additionalContext, } = input;
    const additional_context = buildAdditionalContext({
        learningPathId,
        learningPathName,
        additionalContext,
    });
    const passFromToken = userMember?.pass_type;
    const currentJob = profileOverride?.current_job?.trim() ||
        pickProfileField(userMember, ['jobTitle', 'position', 'firstName']) ||
        UNSPECIFIED;
    const targetJob = profileOverride?.target_job?.trim() ||
        pickProfileField(userMember, ['target_role', 'targetRole']) ||
        UNSPECIFIED;
    const industry = profileOverride?.industry?.trim() ||
        pickProfileField(userMember, ['industry', 'company']) ||
        UNSPECIFIED;
    const timeframe = profileOverride?.timeframe?.trim() ||
        pickProfileField(userMember, ['timeframe', 'studyTimeframe']) ||
        UNSPECIFIED;
    const skillLevel = profileOverride?.skill_level?.trim();
    const meta = {
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
            ...(additional_context ? { additional_context } : {}),
        },
    };
    return meta;
}
