import axios, { AxiosInstance } from 'axios';
import { configureFsAi } from './fsAiApi';

export interface StepOption {
    id: string;
    label: string;
}

export interface OnboardingStep {
    step_id: string;
    prompt_th: string;
    input_type: string;
    options: StepOption[];
    max_selections?: number | null;
    completed?: boolean;
}

export interface OnboardingSession {
    session_id: string;
    user_id: string;
    status: string;
    segment: string | null;
    current_step: OnboardingStep | null;
    is_complete: boolean;
}

export interface UserEnsureBody {
    provider: string;
    provider_user_id: string;
    email?: string;
    name?: string;
    avatar_url?: string;
}

export interface UserProfileOut {
    current_job?: string | null;
    target_job?: string | null;
    industry?: string | null;
    timeframe?: string | null;
    skill_level?: string | null;
}

export interface UserEnsureResponse {
    user_id: string;
    is_new: boolean;
    onboarding_complete: boolean;
    user_profile?: UserProfileOut | null;
}

export interface OnboardingOutcome {
    starter_profile: {
        segment: string | null;
        segment_label: string | null;
        summary_th: string;
        interest_domains: string[];
        disclaimer: string;
    };
    recommended_courses: Array<{
        order: number;
        course_id: number;
        course_name: string;
        summary_en: string;
        guidance: string;
        relevance_score?: number | null;
    }>;
}

function apiV1Base(): string | null {
    if (process.env.NEXT_PUBLIC_FS_AI_USE_PROXY === 'true') {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/api/fs-ai`;
        }
        const port = process.env.PORT || '3000';
        return `http://127.0.0.1:${port}/api/fs-ai`;
    }
    const base = process.env.NEXT_PUBLIC_FS_AI_API_URL?.replace(/\/$/, '');
    return base ? `${base}/api/v1` : null;
}

function createClient(): AxiosInstance | null {
    const base = apiV1Base();
    if (!base) return null;
    return axios.create({ baseURL: base, timeout: 30000 });
}

export const onboardingApi = {
    async ensureUser(body: UserEnsureBody): Promise<UserEnsureResponse> {
        const c = createClient();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.post<UserEnsureResponse>('/users/ensure', body);
        return data;
    },

    async getSession(userId: string, restart = false): Promise<OnboardingSession> {
        const c = createClient();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get<OnboardingSession>('/onboarding/session', {
            params: { user_id: userId, restart },
        });
        return data;
    },

    async startSession(userId: string, restart = false): Promise<OnboardingSession> {
        const c = createClient();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.post<OnboardingSession>(
            '/onboarding/session',
            { user_id: userId },
            { params: { restart } }
        );
        return data;
    },

    async submitAnswer(
        userId: string,
        stepId: string,
        answer: string | string[] | number | null,
        otherText?: string
    ): Promise<OnboardingSession> {
        const c = createClient();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.post<OnboardingSession>('/onboarding/answer', {
            user_id: userId,
            step_id: stepId,
            answer,
            other_text: otherText ?? null,
        });
        return data;
    },

    async getOutcome(userId: string): Promise<OnboardingOutcome> {
        const c = createClient();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get<OnboardingOutcome>('/onboarding/outcome', {
            params: { user_id: userId },
        });
        return data;
    },
};

export { configureFsAi };
