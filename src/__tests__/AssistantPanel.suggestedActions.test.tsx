import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantContextProvider } from '../contexts/assistantContext';
import { AssistantPanel } from '../components/AssistantPanel';
import { SUGGESTED_ACTIONS_BY_MODE, resolveSuggestedActions } from '../components/SuggestedActions';
import { useAssistantStream } from '../hooks/useAssistantStream';
import type { SuggestedAction } from '../types/learningAssistant';

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

const PAGE: SuggestedAction[] = [
    { action_intent: 'concept_translator', label_th: 'อธิบายเนื้อหานี้' },
    { action_intent: 'summary_maker', label_th: 'สรุปบทเรียน' },
];
const FROM_STREAM: SuggestedAction[] = [{ action_intent: 'quiz_me', label_th: 'ข้อสอบ + เฉลย' }];

function mockStream(suggestedActions: SuggestedAction[]) {
    streamMock.mockReturnValue({
        messages: [],
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

function renderPanel(suggestedActions?: SuggestedAction[]) {
    return render(
        <AssistantContextProvider>
            <AssistantPanel
                canUse
                surface="watch"
                courseId={1}
                lessonId={1}
                modes={['during_class']}
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
