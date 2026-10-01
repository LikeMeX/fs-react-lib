import { TextDecoder } from 'util';
import { act, renderHook } from '@testing-library/react';
import { configureFsAi } from '../services/fsAiApi';
import { useAssistantStream } from '../hooks/useAssistantStream';
import type { SendStreamBody } from '../types/learningAssistant';

//* jsdom has no TextDecoder; the hook decodes the stream with it.
Object.assign(globalThis, { TextDecoder: globalThis.TextDecoder ?? TextDecoder });

const BODY = { message: 'ช่วยวางแผนการเรียน', metadata: {} } as unknown as SendStreamBody;

const finishedStream = () => ({ getReader: () => ({ read: async () => ({ done: true, value: undefined }) }) });

/** The host gate: only the current token opens the stream. */
const gateFetch = (validToken: string) =>
    jest.fn(async (_url: string, init: RequestInit) => {
        const auth = (init.headers as Record<string, string>).Authorization;
        return auth === `Bearer ${validToken}`
            ? { ok: true, status: 200, body: finishedStream() }
            : { ok: false, status: 401, statusText: 'Unauthorized', body: null, text: async () => 'Token expired' };
    });

const sentTokens = (fetchMock: jest.Mock) =>
    fetchMock.mock.calls.map(([, init]) => (init.headers as Record<string, string>).Authorization);

const send = async () => {
    const { result } = renderHook(() => useAssistantStream());
    await act(async () => {
        await result.current.send('conv-1', BODY);
    });
    return result;
};

describe('useAssistantStream after the host token expires', () => {
    const originalFetch = global.fetch;
    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renews the token once and resends the message with the new one', async () => {
        let token = 'expired';
        const onUnauthorized = jest.fn(async () => {
            token = 'fresh';
            return true;
        });
        configureFsAi({ getToken: () => token, onUnauthorized });
        const fetchMock = gateFetch('fresh');
        global.fetch = fetchMock as unknown as typeof fetch;

        const result = await send();

        expect(onUnauthorized).toHaveBeenCalledTimes(1);
        expect(sentTokens(fetchMock)).toEqual(['Bearer expired', 'Bearer fresh']);
        expect(result.current.error).toBeNull();
    });

    it('shows the 401 when the host could not renew', async () => {
        configureFsAi({ getToken: () => 'expired', onUnauthorized: async () => false });
        const fetchMock = gateFetch('fresh');
        global.fetch = fetchMock as unknown as typeof fetch;
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        const result = await send();

        expect(sentTokens(fetchMock)).toEqual(['Bearer expired']);
        expect(result.current.error).toBe('FS AI 401: Token expired');
    });

    it('shows the host failure, not the 401, when the renewal itself fails', async () => {
        configureFsAi({
            getToken: () => 'expired',
            onUnauthorized: async () => {
                throw new Error('refresh endpoint down');
            },
        });
        const fetchMock = gateFetch('fresh');
        global.fetch = fetchMock as unknown as typeof fetch;

        const result = await send();

        expect(sentTokens(fetchMock)).toEqual(['Bearer expired']);
        expect(result.current.error).toBe('refresh endpoint down');
    });
});
