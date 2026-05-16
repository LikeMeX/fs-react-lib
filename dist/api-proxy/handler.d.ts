import type { NextApiRequest, NextApiResponse } from 'next';
export interface CreateFsAiProxyHandlerOptions {
    /** Upstream FS AI origin, e.g. https://<your-fs-ai-host>. Defaults to env FS_AI_API_URL / NEXT_PUBLIC_FS_AI_API_URL. */
    upstreamUrl?: string;
    /** Server-only API key. Defaults to env FS_AI_X_API_KEY / FS_AI_API_KEY. */
    apiKey?: string;
}
export declare function createFsAiProxyHandler(opts?: CreateFsAiProxyHandlerOptions): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
