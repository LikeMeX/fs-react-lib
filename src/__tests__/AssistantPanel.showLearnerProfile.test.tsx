import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantContextProvider } from '../contexts/assistantContext';
import { AssistantPanel } from '../components/AssistantPanel';
import { writeAssistantUserProfile } from '../helpers/assistantUserProfile';

jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('remark-gfm', () => () => undefined);
jest.mock('remark-math', () => () => undefined);
jest.mock('rehype-katex', () => () => undefined);

const PROFILE_LABEL = 'แก้ไขโปรไฟล์ผู้เรียน';
const HISTORY_LABEL = 'เลือกบทสนทนาก่อนหน้า';
const NEW_CHAT_LABEL = 'เริ่มบทสนทนาใหม่';
const CLOSE_LABEL = 'ปิดผู้ช่วยการเรียน';

function renderPanel(props: React.ComponentProps<typeof AssistantPanel> = {}) {
    return render(
        <AssistantContextProvider>
            <AssistantPanel canUse surface="general" modes={['general']} {...props} />
        </AssistantContextProvider>
    );
}

describe('AssistantPanel showLearnerProfile', () => {
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

    it('shows the learner profile navbar control once a complete profile exists', () => {
        writeAssistantUserProfile({
            current_job: 'นักพัฒนา',
            target_job: 'สถาปนิกระบบ',
            industry: 'เทคโนโลยี',
            timeframe: '1 ปี',
        });
        renderPanel();
        expect(screen.getByLabelText(PROFILE_LABEL)).toBeEnabled();
        expect(screen.getByLabelText(HISTORY_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(NEW_CHAT_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(CLOSE_LABEL)).toBeInTheDocument();
    });

    it('hides the learner profile navbar control while the profile is unavailable', () => {
        renderPanel();
        expect(screen.queryByLabelText(PROFILE_LABEL)).not.toBeInTheDocument();
        expect(screen.getByLabelText(HISTORY_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(NEW_CHAT_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(CLOSE_LABEL)).toBeInTheDocument();
    });

    it('hides the learner profile navbar control when showLearnerProfile is false', () => {
        writeAssistantUserProfile({
            current_job: 'นักพัฒนา',
            target_job: 'สถาปนิกระบบ',
            industry: 'เทคโนโลยี',
            timeframe: '1 ปี',
        });
        renderPanel({ showLearnerProfile: false });
        expect(screen.queryByLabelText(PROFILE_LABEL)).not.toBeInTheDocument();
        expect(screen.getByLabelText(HISTORY_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(NEW_CHAT_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(CLOSE_LABEL)).toBeInTheDocument();
    });
});
