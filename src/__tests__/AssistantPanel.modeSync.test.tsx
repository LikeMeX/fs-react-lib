import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantContextProvider } from '../contexts/assistantContext';
import { AssistantPanel } from '../components/AssistantPanel';
import { useAssistantPhase } from '../hooks/useAssistantPhase';
import type { LearningModeApi } from '../types/learningAssistant';

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

const phaseMock = useAssistantPhase as unknown as jest.Mock;

const DURING: LearningModeApi[] = ['during_class'];
const AFTER: LearningModeApi[] = ['after_class'];
const PICKER_MODES: LearningModeApi[] = ['during_class', 'after_class'];

function lastOverrideMode(): LearningModeApi | null {
    return phaseMock.mock.calls[phaseMock.mock.calls.length - 1][0].overrideMode;
}

function tree(modes: LearningModeApi[]) {
    return (
        <AssistantContextProvider>
            <AssistantPanel canUse surface="watch" courseId={1} lessonId={1} modes={modes} />
        </AssistantContextProvider>
    );
}

describe('AssistantPanel single-mode sync', () => {
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
        phaseMock.mockClear();
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_FS_AI_USE_PROXY = prevProxy;
        process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = prevSkillpass;
    });

    it('follows the host when the single allowed mode changes, without a remount', () => {
        const { rerender } = render(tree(DURING));
        expect(lastOverrideMode()).toBe('during_class');

        rerender(tree(AFTER));

        expect(lastOverrideMode()).toBe('after_class');
    });

    it('leaves the mode unset on multi-mode surfaces so the ModePicker still decides', () => {
        const { rerender } = render(tree(PICKER_MODES));
        expect(lastOverrideMode()).toBeNull();

        rerender(tree(PICKER_MODES));

        expect(lastOverrideMode()).toBeNull();
    });
});
