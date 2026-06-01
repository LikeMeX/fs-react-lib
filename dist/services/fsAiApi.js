"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsAiApi = void 0;
exports.configureFsAi = configureFsAi;
const axios_1 = __importDefault(require("axios"));
const onboardingApi_1 = require("./onboardingApi");
let tokenProvider = () => null;
function configureFsAi(opts) {
    tokenProvider = opts.getToken;
    (0, onboardingApi_1.configureOnboardingAuth)(opts);
}
function isFsAiProxyEnabled() {
    return process.env.NEXT_PUBLIC_FS_AI_USE_PROXY === 'true';
}
function proxyBaseUrl() {
    if (!isFsAiProxyEnabled())
        return null;
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api/fs-ai`;
    }
    const port = process.env.PORT || '3000';
    return `http://127.0.0.1:${port}/api/fs-ai`;
}
function directBaseUrl() {
    const base = process.env.NEXT_PUBLIC_FS_AI_API_URL?.replace(/\/$/, '');
    return base ? `${base}/api/v1` : null;
}
function apiV1Base() {
    if (isFsAiProxyEnabled()) {
        return proxyBaseUrl();
    }
    return directBaseUrl();
}
function createClient() {
    const base = apiV1Base();
    if (!base)
        return null;
    const client = axios_1.default.create({
        baseURL: base,
        timeout: 30000,
    });
    client.interceptors.request.use(config => {
        const token = tokenProvider();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    return client;
}
const client = () => createClient();
exports.fsAiApi = {
    async createConversation(body) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.post('/chat/conversations', body);
        return data;
    },
    async getConversation(conversationId) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get(`/chat/conversations/${conversationId}`);
        return data;
    },
    async listConversations(userId, opts) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        const { data } = await c.get('/chat/conversations', {
            params: {
                user_id: userId,
                offset: opts?.offset ?? 0,
                limit: opts?.limit ?? 100,
            },
        });
        return data;
    },
    async updateConversationTitle(conversationId, title) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        await c.patch(`/chat/conversations/${conversationId}`, { title });
    },
    async deleteConversation(conversationId) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        await c.delete(`/chat/conversations/${conversationId}`);
    },
    async patchLearningMode(conversationId, body) {
        const c = client();
        if (!c)
            throw new Error('FS_AI_API_NOT_CONFIGURED');
        const payload = {
            mode: body.mode,
            course_id: String(body.course_id),
        };
        if (body.lesson_id != null)
            payload.lesson_id = String(body.lesson_id);
        if (body.chapter_id != null)
            payload.chapter_id = String(body.chapter_id);
        await c.post(`/chat/conversations/${conversationId}/learning-mode`, payload);
    },
    streamMessagesUrl(conversationId) {
        if (isFsAiProxyEnabled()) {
            return `/api/fs-ai/chat/conversations/${conversationId}/messages/stream`;
        }
        const base = process.env.NEXT_PUBLIC_FS_AI_API_URL?.replace(/\/$/, '') || '';
        return `${base}/api/v1/chat/conversations/${conversationId}/messages/stream`;
    },
    buildStreamInit(_conversationId, body) {
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
