import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantContextProvider } from '../contexts/assistantContext';
import { AssistantPanel } from '../components/AssistantPanel';
import {
    SUGGESTED_ACTIONS_BY_MODE,
    SuggestedActions,
    resolveSuggestedActions,
} from '../components/SuggestedActions';
import { useAssistantPhase } from '../hooks/useAssistantPhase';
import { useAssistantStream } from '../hooks/useAssistantStream';
import type { AssistantMessage, LearningModeApi, SuggestedAction } from '../types/learningAssistant';

jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('rehype-katex', () => () => undefined);

jest.mock('../hooks/useAssistantPhase', () => ({
    useAssistantPhase: jest.fn(() => ({ phase: 'during', apiMode: 'during_class', lastError: null })),
}));

jest.mock('../hooks/useAssistantStream', () => ({
    useAssistantStream: jest.fn(),
}));

const streamMock = useAssistantStream as unknown as jest.Mock;
const phaseMock = useAssistantPhase as unknown as jest.Mock;
const DURING_PHASE = { phase: 'during', apiMode: 'during_class', lastError: null };

const PAGE: SuggestedAction[] = [
    { action_intent: 'concept_translator', label_th: 'อธิบายเนื้อหานี้' },
    { action_intent: 'summary_maker', label_th: 'สรุปบทเรียน' },
];
const FROM_STREAM: SuggestedAction[] = [{ action_intent: 'quiz_me', label_th: 'ข้อสอบ + เฉลย' }];

function mockStream(suggestedActions: SuggestedAction[], messages: AssistantMessage[] = []) {
    streamMock.mockReturnValue({
        messages,
        setMessages: jest.fn(),
        suggestedActions,
        streaming: false,
        error: null,
        send: jest.fn(),
        abort: jest.fn(),
        reset: jest.fn(),
    });
}

// The closed panel is aria-hidden, so role queries must opt into hidden elements.
function chipLabels(): string[] {
    const list = screen.getByRole('list', { name: 'ข้อความแนะนำ', hidden: true });
    return within(list)
        .getAllByRole('listitem', { hidden: true })
        .map(el => el.textContent ?? '');
}

function renderPanel(suggestedActions?: SuggestedAction[], modes: LearningModeApi[] = ['during_class']) {
    return render(
        <AssistantContextProvider>
            <AssistantPanel
                canUse
                surface="watch"
                courseId={1}
                lessonId={1}
                modes={modes}
                collectLearnerProfile={false}
                suggestedActions={suggestedActions}
            />
        </AssistantContextProvider>
    );
}

describe('resolveSuggestedActions', () => {
    it('uses the pinned set even when the stream returned chips', () => {
        expect(resolveSuggestedActions('during_class', FROM_STREAM, PAGE)).toBe(PAGE);
    });

    it('treats an empty pinned set as "no chips", not as unset', () => {
        expect(resolveSuggestedActions('during_class', FROM_STREAM, [])).toEqual([]);
    });

    it('falls back to stream chips, then mode defaults, when nothing is pinned', () => {
        expect(resolveSuggestedActions('during_class', FROM_STREAM)).toBe(FROM_STREAM);
        expect(resolveSuggestedActions('during_class', [])).toBe(SUGGESTED_ACTIONS_BY_MODE.during_class);
    });
});

describe('AssistantPanel suggestedActions prop', () => {
    const prevProxy = process.env.NEXT_PUBLIC_FS_AI_USE_PROXY;
    const prevSkillpass = process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING;

    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => undefined,
                removeListener: () => undefined,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
                dispatchEvent: () => false,
            }),
        });
        Element.prototype.scrollIntoView = jest.fn();
    });

    beforeEach(() => {
        process.env.NEXT_PUBLIC_FS_AI_USE_PROXY = 'true';
        process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = 'false';
        window.localStorage.clear();
        phaseMock.mockReturnValue(DURING_PHASE);
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_FS_AI_USE_PROXY = prevProxy;
        process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = prevSkillpass;
    });

    it('keeps the page chips after the assistant returns its own', () => {
        mockStream(FROM_STREAM);
        renderPanel(PAGE);

        expect(chipLabels()).toEqual(['อธิบายเนื้อหานี้', 'สรุปบทเรียน']);
    });

    it('keeps the page chips once the conversation has messages', () => {
        mockStream(FROM_STREAM, [
            { id: 'u1', role: 'user', content: 'อธิบายเนื้อหานี้' },
            { id: 'a1', role: 'assistant', content: 'คำอธิบาย' },
        ]);
        renderPanel(PAGE);

        expect(screen.getByText('คำอธิบาย')).toBeInTheDocument();
        expect(chipLabels()).toEqual(['อธิบายเนื้อหานี้', 'สรุปบทเรียน']);
    });

    it('keeps the page chips when the host switches to after_class', () => {
        mockStream(FROM_STREAM);
        const { rerender } = renderPanel(PAGE);

        phaseMock.mockReturnValue({ phase: 'after', apiMode: 'after_class', lastError: null });
        rerender(
            <AssistantContextProvider>
                <AssistantPanel
                    canUse
                    surface="watch"
                    courseId={1}
                    lessonId={1}
                    modes={['after_class']}
                    collectLearnerProfile={false}
                    suggestedActions={PAGE}
                />
            </AssistantContextProvider>
        );

        expect(phaseMock.mock.calls[phaseMock.mock.calls.length - 1][0].overrideMode).toBe('after_class');
        expect(chipLabels()).toEqual(['อธิบายเนื้อหานี้', 'สรุปบทเรียน']);
        expect(chipLabels()).not.toEqual(
            SUGGESTED_ACTIONS_BY_MODE.after_class.map(a => a.label_th)
        );
    });

    it('hides the chips when the page pins an empty set', () => {
        mockStream(FROM_STREAM);
        renderPanel([]);

        expect(screen.queryByRole('list', { name: 'ข้อความแนะนำ', hidden: true })).toBeNull();
    });

    it('keeps the current behaviour when the prop is omitted', () => {
        mockStream([]);
        const { unmount } = renderPanel();
        expect(chipLabels()).toEqual(SUGGESTED_ACTIONS_BY_MODE.during_class.map(a => a.label_th));
        unmount();

        mockStream(FROM_STREAM);
        renderPanel();
        expect(chipLabels()).toEqual(['ข้อสอบ + เฉลย']);
    });
});

describe('SuggestedActions chip click', () => {
    const PINNED: SuggestedAction[] = [
        { action_intent: 'assignment_overview', label_th: 'สรุปหลักสูตรที่ได้รับมอบหมาย' },
        { action_intent: 'summary_maker', label_th: 'สรุป', prompt: 'ช่วยสรุป key takeaways' },
    ];

    function renderChips(onSelect: jest.Mock) {
        render(
            <SuggestedActions mode="general" actions={FROM_STREAM} pinned={PINNED} onSelect={onSelect} />
        );
    }

    it('sends a pinned chip with its label as the message and its own action_intent', () => {
        const onSelect = jest.fn();
        renderChips(onSelect);

        fireEvent.click(screen.getByRole('listitem', { name: 'สรุปหลักสูตรที่ได้รับมอบหมาย' }));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith('สรุปหลักสูตรที่ได้รับมอบหมาย', 'assignment_overview');
    });

    it('sends the prompt instead of the label when a pinned chip has one', () => {
        const onSelect = jest.fn();
        renderChips(onSelect);

        fireEvent.click(screen.getByRole('listitem', { name: 'สรุป' }));

        expect(onSelect).toHaveBeenCalledWith('ช่วยสรุป key takeaways', 'summary_maker');
    });

    it('never offers the stream chips while a pinned set is shown', () => {
        renderChips(jest.fn());

        expect(screen.queryByRole('listitem', { name: 'ข้อสอบ + เฉลย' })).toBeNull();
    });
});
