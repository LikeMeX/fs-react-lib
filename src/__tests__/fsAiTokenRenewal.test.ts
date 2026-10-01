/**
 * @jest-environment node
 */
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { configureFsAi, fsAiApi } from '../services/fsAiApi';
import { onboardingApi } from '../services/onboardingApi';

//* A host session whose token has expired: FS AI answers 401 until the host renews it.
let token = 'expired';
let renewals = 0;
const sentWith: Array<string | undefined> = [];

const renewToFresh = async () => {
    renewals += 1;
    token = 'fresh';
    return true;
};

const respond = (config: InternalAxiosRequestConfig, status: number): AxiosResponse => {
    const response = { data: { id: 'conv-1' }, status, statusText: '', headers: {}, config };
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, String(status), config, null, response);
    return response;
};

/** FS AI as the host gate sees it: only the current token passes. */
const gate = (validToken: () => string, status = 401) => async (config: InternalAxiosRequestConfig) => {
    const auth = config.headers?.Authorization as string | undefined;
    sentWith.push(auth);
    //* A retry loop never yields to timers, so a test timeout would not end it; fail it here.
    if (sentWith.length > 5) throw new Error('retry loop');
    return respond(config, auth === `Bearer ${validToken()}` ? 200 : status);
};

const originalAdapter = axios.defaults.adapter;

beforeEach(() => {
    process.env.NEXT_PUBLIC_FS_AI_API_URL = 'https://fs-ai.test';
    delete process.env.NEXT_PUBLIC_FS_AI_USE_PROXY;
    token = 'expired';
    renewals = 0;
    sentWith.length = 0;
    axios.defaults.adapter = gate(() => 'fresh');
});

afterAll(() => {
    axios.defaults.adapter = originalAdapter;
});

describe('FS AI calls after the host token expires', () => {
    it('renew the token once and retry with the new one', async () => {
        configureFsAi({ getToken: () => token, onUnauthorized: renewToFresh });

        await expect(fsAiApi.createConversation({})).resolves.toEqual({ id: 'conv-1' });

        expect(renewals).toBe(1);
        expect(sentWith).toEqual(['Bearer expired', 'Bearer fresh']);
    });

    it('renew for the onboarding client too', async () => {
        configureFsAi({ getToken: () => token, onUnauthorized: renewToFresh });

        await onboardingApi.ensureUser({ provider: 'futureskill', provider_user_id: 'u-1' });

        expect(sentWith).toEqual(['Bearer expired', 'Bearer fresh']);
    });

    it('share one renewal between requests that fail together', async () => {
        let release: () => void = () => undefined;
        const held = new Promise<void>(resolve => (release = resolve));
        configureFsAi({
            getToken: () => token,
            onUnauthorized: async () => {
                await held;
                return renewToFresh();
            },
        });

        const both = Promise.all([fsAiApi.createConversation({}), fsAiApi.createConversation({})]);
        await new Promise(resolve => setTimeout(resolve, 0));
        release();
        await both;

        expect(renewals).toBe(1);
    });

    it('surface the 401 when the host has no way to renew', async () => {
        configureFsAi({ getToken: () => token });

        await expect(fsAiApi.createConversation({})).rejects.toMatchObject({ response: { status: 401 } });
        expect(sentWith).toEqual(['Bearer expired']);
    });

    it('surface the 401 when the host could not renew', async () => {
        configureFsAi({ getToken: () => token, onUnauthorized: async () => false });

        await expect(fsAiApi.createConversation({})).rejects.toMatchObject({ response: { status: 401 } });
        expect(sentWith).toEqual(['Bearer expired']);
    });

    it('retry only once when the renewed token is refused too', async () => {
        axios.defaults.adapter = gate(() => 'never-valid');
        configureFsAi({ getToken: () => token, onUnauthorized: renewToFresh });

        await expect(fsAiApi.createConversation({})).rejects.toMatchObject({ response: { status: 401 } });
        expect(renewals).toBe(1);
        expect(sentWith).toEqual(['Bearer expired', 'Bearer fresh']);
    });

    it('leave a 403 alone: it is not an expired session', async () => {
        axios.defaults.adapter = gate(() => 'never-valid', 403);
        configureFsAi({ getToken: () => token, onUnauthorized: renewToFresh });

        await expect(fsAiApi.createConversation({})).rejects.toMatchObject({ response: { status: 403 } });
        expect(renewals).toBe(0);
    });

    it('let a failing host renewal surface as itself, not as a 401', async () => {
        configureFsAi({
            getToken: () => token,
            onUnauthorized: async () => {
                throw new Error('refresh endpoint down');
            },
        });

        await expect(fsAiApi.createConversation({})).rejects.toThrow('refresh endpoint down');
    });
});
