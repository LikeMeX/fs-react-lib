/**
 * @jest-environment node
 */
import { EventEmitter } from 'events';
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createFsAiProxyHandler, FS_AI_CHANNEL_HEADER } from '../api-proxy/handler';

jest.mock('axios');
const mockedAxios = axios as unknown as jest.Mock;

function fakeReq(headers: Record<string, string> = {}): NextApiRequest {
    const req = new EventEmitter() as unknown as NextApiRequest;
    Object.assign(req, {
        method: 'GET',
        headers,
        query: { slug: ['chat', 'conversations'] },
    });
    return req;
}

function fakeRes(): NextApiResponse {
    const res = {
        headersSent: false,
        writableEnded: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn(),
        setHeader: jest.fn(),
    };
    return res as unknown as NextApiResponse;
}

function upstreamStream() {
    const data = new EventEmitter() as EventEmitter & { pipe: jest.Mock };
    data.pipe = jest.fn();
    return { status: 200, headers: {}, data };
}

function forwardedHeaders(): Record<string, string> {
    expect(mockedAxios).toHaveBeenCalledTimes(1);
    return mockedAxios.mock.calls[0][0].headers;
}

describe('createFsAiProxyHandler channel header', () => {
    beforeEach(() => {
        mockedAxios.mockReset();
        mockedAxios.mockResolvedValue(upstreamStream());
    });

    const base = { upstreamUrl: 'https://fs-ai.test', apiKey: 'k' };

    it('sends the host-fixed channel upstream', async () => {
        await createFsAiProxyHandler({ ...base, channel: 'b2c' })(fakeReq(), fakeRes());
        expect(forwardedHeaders()[FS_AI_CHANNEL_HEADER]).toBe('b2c');
    });

    it('lets a per-request channel override the host default', async () => {
        const proxy = createFsAiProxyHandler({ ...base, channel: 'b2c' });
        await proxy(fakeReq(), fakeRes(), { channel: 'b2b' });
        expect(forwardedHeaders()[FS_AI_CHANNEL_HEADER]).toBe('b2b');
    });

    it('never forwards a channel the browser supplied', async () => {
        const spoofed = fakeReq({ 'x-fs-channel': 'b2b' });
        await createFsAiProxyHandler({ ...base, channel: 'b2c' })(spoofed, fakeRes());
        const headers = forwardedHeaders();
        expect(headers[FS_AI_CHANNEL_HEADER]).toBe('b2c');
        expect(Object.keys(headers).filter(k => k.toLowerCase() === 'x-fs-channel')).toHaveLength(1);
    });

    it('drops a browser-supplied channel even when the host sets none', async () => {
        await createFsAiProxyHandler(base)(fakeReq({ 'x-fs-channel': 'b2b' }), fakeRes());
        const headers = forwardedHeaders();
        expect(Object.keys(headers).map(k => k.toLowerCase())).not.toContain('x-fs-channel');
    });
});
