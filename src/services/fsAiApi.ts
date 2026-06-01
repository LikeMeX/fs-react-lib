import axios, { AxiosInstance } from 'axios';
import { configureOnboardingAuth } from './onboardingApi';
import {
    ConversationListOut,
    ConversationOut,
    CreateConversationBody,
    CreateConversationResponse,
    PatchLearningModeBody,
    SendStreamBody,
} from '../types/learningAssistant';

let tokenProvider: () => string | null | undefined = () => null;

export function configureFsAi(opts: { getToken: () => string | null | undefined }): void {
    tokenProvider = opts.getToken;
    configureOnboardingAuth(opts);
}

function isFsAiProxyEnabled(): boolean {
    return process.env.NEXT_PUBLIC_FS_AI_USE_PROXY === 'true';
}

function proxyBaseUrl(): string | null {
    if (!isFsAiProxyEnabled()) return null;
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api/fs-ai`;
    }
    const port = process.env.PORT || '3000';
    return `http://127.0.0.1:${port}/api/fs-ai`;
}

function directBaseUrl(): string | null {
    const base = process.env.NEXT_PUBLIC_FS_AI_API_URL?.replace(/\/$/, '');
    return base ? `${base}/api/v1` : null;
}

function apiV1Base(): string | null {
    if (isFsAiProxyEnabled()) {
        return proxyBaseUrl();
    }
    return directBaseUrl();
}

function createClient(): AxiosInstance | null {
    const base = apiV1Base();
    if (!base) return null;
    const client = axios.create({
        baseURL: base,
        timeout: 30000,
    });
    client.interceptors.request.use(config => {
        const token = tokenProvider();
        if (token && config.headers) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        return config;
    });
    return client;
}

const client = () => createClient();

export const fsAiApi = {
    async createConversation(body: CreateConversationBody): Promise<CreateConversationResponse> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.post<CreateConversationResponse>('/chat/conversations', body);
        return data;
    },

    async getConversation(conversationId: string): Promise<ConversationOut> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get<ConversationOut>(`/chat/conversations/${conversationId}`);
        return data;
    },

    async listConversations(
        userId: string,
        opts?: { offset?: number; limit?: number }
    ): Promise<ConversationListOut> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get<ConversationListOut>('/chat/conversations', {
            params: {
                user_id: userId,
                offset: opts?.offset ?? 0,
                limit: opts?.limit ?? 100,
            },
        });
        return data;
    },

    async updateConversationTitle(conversationId: string, title: string): Promise<void> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        await c.patch(`/chat/conversations/${conversationId}`, { title });
    },

    async deleteConversation(conversationId: string): Promise<void> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        await c.delete(`/chat/conversations/${conversationId}`);
    },

    async patchLearningMode(conversationId: string, body: PatchLearningModeBody): Promise<void> {
        const c = client();
        if (!c) throw new Error('FS_AI_API_NOT_CONFIGURED');
        const payload: Record<string, string> = {
            mode: body.mode,
            course_id: String(body.course_id),
        };
        if (body.lesson_id != null) payload.lesson_id = String(body.lesson_id);
        if (body.chapter_id != null) payload.chapter_id = String(body.chapter_id);
        await c.post(`/chat/conversations/${conversationId}/learning-mode`, payload);
    },

    streamMessagesUrl(conversationId: string): string {
        if (isFsAiProxyEnabled()) {
            return `/api/fs-ai/chat/conversations/${conversationId}/messages/stream`;
        }
        const base = process.env.NEXT_PUBLIC_FS_AI_API_URL?.replace(/\/$/, '') || '';
        return `${base}/api/v1/chat/conversations/${conversationId}/messages/stream`;
    },

    buildStreamInit(_conversationId: string, body: SendStreamBody): RequestInit {
        const token = tokenProvider() || '';
        return {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        };
    },
};
