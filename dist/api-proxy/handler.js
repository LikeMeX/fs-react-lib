"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFsAiProxyHandler = createFsAiProxyHandler;
const axios_1 = __importDefault(require("axios"));
function readBody(req) {
    const method = req.method || 'GET';
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
        return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => {
            chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
        });
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}
function buildUpstreamQuery(req) {
    const q = { ...req.query };
    delete q.slug;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(q)) {
        if (value === undefined)
            continue;
        const list = Array.isArray(value) ? value : [value];
        for (const v of list) {
            if (v !== undefined && v !== '')
                params.append(key, String(v));
        }
    }
    const s = params.toString();
    return s ? `?${s}` : '';
}
function createFsAiProxyHandler(opts = {}) {
    return async function handler(req, res) {
        if (req.method === 'OPTIONS') {
            res.status(204).end();
            return;
        }
        const baseRaw = opts.upstreamUrl?.trim() ||
            process.env.FS_AI_API_URL?.trim() ||
            process.env.NEXT_PUBLIC_FS_AI_API_URL?.trim() ||
            '';
        const base = baseRaw.replace(/\/$/, '');
        const apiKey = opts.apiKey?.trim() ||
            process.env.FS_AI_X_API_KEY?.trim() ||
            process.env.FS_AI_API_KEY?.trim() ||
            '';
        if (!base || !apiKey) {
            res.status(503).json({
                error: 'FS_AI proxy is not configured. Set FS_AI_X_API_KEY (server) and either FS_AI_API_URL or NEXT_PUBLIC_FS_AI_API_URL (upstream origin). Restart Next after changing .env.',
            });
            return;
        }
        const slugParam = req.query.slug;
        const slug = slugParam ? (Array.isArray(slugParam) ? slugParam : [slugParam]) : [];
        if (!slug.length) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        if (slug.some(s => typeof s !== 'string' || s.includes('..'))) {
            res.status(400).json({ error: 'Bad path' });
            return;
        }
        const path = slug.map(s => encodeURIComponent(s)).join('/');
        const qs = buildUpstreamQuery(req);
        const target = `${base}/api/v1/${path}${qs}`;
        const headers = {
            'X-API-Key': apiKey,
        };
        const auth = req.headers.authorization;
        if (typeof auth === 'string' && auth.length) {
            headers.Authorization = auth;
        }
        const ct = req.headers['content-type'];
        if (typeof ct === 'string') {
            headers['Content-Type'] = ct;
        }
        let body;
        try {
            body = await readBody(req);
        }
        catch {
            res.status(400).json({ error: 'Invalid body' });
            return;
        }
        const method = (req.method || 'GET').toLowerCase();
        try {
            const upstream = await (0, axios_1.default)({
                method,
                url: target,
                headers,
                data: body && body.length ? body : undefined,
                responseType: 'stream',
                timeout: 0,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                validateStatus: () => true,
            });
            res.status(upstream.status);
            const skip = new Set(['transfer-encoding', 'connection', 'content-length']);
            for (const [key, value] of Object.entries(upstream.headers)) {
                if (value == null)
                    continue;
                const k = key.toLowerCase();
                if (skip.has(k))
                    continue;
                const v = Array.isArray(value) ? value.join(', ') : String(value);
                res.setHeader(key, v);
            }
            upstream.data.on('error', () => {
                if (!res.writableEnded)
                    res.end();
            });
            upstream.data.pipe(res);
        }
        catch {
            if (!res.headersSent) {
                res.status(502).json({ error: 'Upstream request failed' });
            }
            else if (!res.writableEnded) {
                res.end();
            }
        }
    };
}
//# sourceMappingURL=handler.js.map