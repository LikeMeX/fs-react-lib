import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantContextProvider } from '../contexts/assistantContext';
import { AssistantPanel } from '../components/AssistantPanel';
import { writeAssistantUserProfile } from '../helpers/assistantUserProfile';
import { onboardingApi } from '../services/onboardingApi';

jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('rehype-katex', () => () => undefined);

jest.mock('../services/onboardingApi', () => {
    const actual = jest.requireActual('../services/onboardingApi');
    return {
        ...actual,
        onboardingApi: {
            ensureUser: jest.fn(),
            updateUserProfile: jest.fn(),
            getSession: jest.fn(),
            startSession: jest.fn(),
            submitAnswer: jest.fn(),
            getOutcome: jest.fn(),
        },
    };
});

const mockedApi = onboardingApi as jest.Mocked<typeof onboardingApi>;

const PROFILE_LABEL = 'แก้ไขโปรไฟล์ผู้เรียน';
const LEGACY_FIRST_QUESTION = /ตอนนี้คุณทำงานในตำแหน่งอะไร/;
const WIZARD_PROMPT = 'คำถามแรกของ onboarding';
const USER_MEMBER = { id: 'member-42', email: 'learner@example.com' };

function renderPanel(props: React.ComponentProps<typeof AssistantPanel> = {}) {
    return render(
        <AssistantContextProvider>
            <AssistantPanel canUse surface="general" modes={['general']} {...props} />
        </AssistantContextProvider>
    );
}

describe('AssistantPanel collectLearnerProfile', () => {
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
        window.localStorage.clear();
        jest.resetAllMocks();
        mockedApi.ensureUser.mockResolvedValue({
            user_id: 'fs-ai-user-1',
            onboarding_complete: false,
            user_profile: null,
        } as Awaited<ReturnType<typeof onboardingApi.ensureUser>>);
        mockedApi.getSession.mockResolvedValue({
            is_complete: false,
            current_step: {
                step_id: 'goal',
                prompt_th: WIZARD_PROMPT,
                input_type: 'text',
                options: [],
            },
        } as unknown as Awaited<ReturnType<typeof onboardingApi.getSession>>);
    });

    afterEach(() => {
        process.env.NEXT_PUBLIC_FS_AI_USE_PROXY = prevProxy;
        process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = prevSkillpass;
    });

    describe('SkillPass onboarding path', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = 'true';
        });

        it('runs Learner onboarding by default (B2C unchanged)', async () => {
            renderPanel({ userMember: USER_MEMBER });
            expect(await screen.findByText(WIZARD_PROMPT)).toBeInTheDocument();
        });

        it('never runs Learner onboarding when collectLearnerProfile is false', async () => {
            renderPanel({ userMember: USER_MEMBER, collectLearnerProfile: false });
            await waitFor(() => expect(mockedApi.ensureUser).toHaveBeenCalled());
            // ensure still runs: conversations need the fs-ai user id it returns.
            await waitFor(() =>
                expect(document.querySelector('.assistant-onboarding-wizard')).not.toBeInTheDocument()
            );
            expect(mockedApi.getSession).not.toHaveBeenCalled();
            expect(mockedApi.startSession).not.toHaveBeenCalled();
            expect(screen.queryByText(WIZARD_PROMPT)).not.toBeInTheDocument();
        });

        it('hides the profile control when collectLearnerProfile is false, even with a saved profile', async () => {
            mockedApi.ensureUser.mockResolvedValue({
                user_id: 'fs-ai-user-1',
                onboarding_complete: true,
                user_profile: {
                    current_job: 'นักพัฒนา',
                    target_job: 'สถาปนิกระบบ',
                    industry: 'เทคโนโลยี',
                    timeframe: '1 ปี',
                },
            } as Awaited<ReturnType<typeof onboardingApi.ensureUser>>);
            mockedApi.getOutcome.mockResolvedValue({
                starter_profile: { summary_th: 'สรุป' },
            } as unknown as Awaited<ReturnType<typeof onboardingApi.getOutcome>>);
            renderPanel({ userMember: USER_MEMBER, collectLearnerProfile: false });
            await waitFor(() => expect(mockedApi.ensureUser).toHaveBeenCalled());
            expect(screen.queryByLabelText(PROFILE_LABEL)).not.toBeInTheDocument();
        });
    });

    describe('legacy profile chat path', () => {
        beforeEach(() => {
            process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING = 'false';
        });

        it('asks the profile questions by default (B2C unchanged)', () => {
            renderPanel();
            expect(screen.getByText(LEGACY_FIRST_QUESTION)).toBeInTheDocument();
        });

        it('never asks the profile questions when collectLearnerProfile is false', () => {
            renderPanel({ collectLearnerProfile: false });
            expect(screen.queryByText(LEGACY_FIRST_QUESTION)).not.toBeInTheDocument();
        });

        it('treats the deprecated showLearnerProfile=false as collectLearnerProfile=false', () => {
            renderPanel({ showLearnerProfile: false });
            expect(screen.queryByText(LEGACY_FIRST_QUESTION)).not.toBeInTheDocument();
        });

        it('lets an explicit collectLearnerProfile win over the deprecated prop', () => {
            writeAssistantUserProfile({
                current_job: 'นักพัฒนา',
                target_job: 'สถาปนิกระบบ',
                industry: 'เทคโนโลยี',
                timeframe: '1 ปี',
            });
            renderPanel({ showLearnerProfile: true, collectLearnerProfile: false });
            expect(screen.queryByLabelText(PROFILE_LABEL)).not.toBeInTheDocument();
        });
    });
});
