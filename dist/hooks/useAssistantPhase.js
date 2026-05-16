"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssistantPhase = useAssistantPhase;
const react_1 = require("react");
const fsAiApi_1 = require("../services/fsAiApi");
const MIN_INTERVAL_MS = 2000;
function deriveApiMode(args) {
    if (args.route === 'general')
        return 'general';
    if (args.route === 'enroll')
        return 'before_class';
    if (args.courseComplete || args.lessonComplete)
        return 'after_class';
    return 'during_class';
}
function deriveUiPhase(mode) {
    if (mode === 'before_class')
        return 'before';
    if (mode === 'after_class')
        return 'after';
    return 'during';
}
function useAssistantPhase(args) {
    const { conversationId, courseId, lessonId, chapterId, enabled, overrideMode } = args;
    const mode = overrideMode ?? deriveApiMode(args);
    const phase = deriveUiPhase(mode);
    const lastSentRef = (0, react_1.useRef)(0);
    const [lastError, setLastError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!enabled || !conversationId || !courseId)
            return;
        const schedule = () => {
            const now = Date.now();
            const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastSentRef.current));
            return window.setTimeout(async () => {
                lastSentRef.current = Date.now();
                try {
                    await fsAiApi_1.fsAiApi.patchLearningMode(conversationId, {
                        mode,
                        course_id: courseId,
                        lesson_id: mode === 'during_class' ? lessonId ?? undefined : undefined,
                        chapter_id: mode === 'during_class' ? chapterId ?? undefined : undefined,
                    });
                    setLastError(null);
                }
                catch (e) {
                    const status = e?.response?.status;
                    setLastError(status === 403 ? 'FORBIDDEN' : 'PATCH_FAILED');
                }
            }, wait);
        };
        const id = schedule();
        return () => clearTimeout(id);
    }, [chapterId, conversationId, courseId, enabled, lessonId, mode]);
    return { phase, apiMode: mode, lastError };
}
//# sourceMappingURL=useAssistantPhase.js.map