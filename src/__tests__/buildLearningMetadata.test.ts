import { buildLearningMetadata } from '../helpers/buildLearningMetadata';

describe('buildLearningMetadata action_intent', () => {
    it('passes assignment_overview through instead of coercing it to free_chat', () => {
        const meta = buildLearningMetadata({ mode: 'general', actionIntent: 'assignment_overview' });
        expect(meta.action_intent).toBe('assignment_overview');
    });

    it('still coerces an intent the backend does not know to free_chat', () => {
        const meta = buildLearningMetadata({ mode: 'general', actionIntent: 'not_a_capability' });
        expect(meta.action_intent).toBe('free_chat');
    });

    it('forwards host additional context such as assigned_learning', () => {
        const assigned = { assignments: [], completed_count: 2, omitted_count: 0 };
        const meta = buildLearningMetadata({
            mode: 'general',
            additionalContext: { assigned_learning: assigned },
        });
        expect(meta.learning_state.additional_context).toEqual({ assigned_learning: assigned });
    });
});
