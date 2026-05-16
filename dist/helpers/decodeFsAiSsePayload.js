"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromStreamJson = extractTextFromStreamJson;
exports.decodeSseDataPayload = decodeSseDataPayload;
/**
 * Decode FS AI (and similar) SSE `data:` payloads where each line may be a JSON-encoded
 * string token (`"ย"`) or an object with `content` / `delta` / OpenAI-style `choices`.
 */
function extractTextFromStreamJson(parsed) {
    if (parsed == null)
        return '';
    if (typeof parsed === 'string')
        return parsed;
    if (typeof parsed === 'number' || typeof parsed === 'boolean')
        return '';
    if (Array.isArray(parsed)) {
        return parsed.map(extractTextFromStreamJson).join('');
    }
    if (typeof parsed !== 'object')
        return '';
    const o = parsed;
    if (typeof o.content === 'string')
        return o.content;
    if (typeof o.text === 'string')
        return o.text;
    if (typeof o.message === 'string')
        return o.message;
    if (typeof o.token === 'string')
        return o.token;
    if (typeof o.chunk === 'string')
        return o.chunk;
    if (o.delta != null)
        return extractTextFromStreamJson(o.delta);
    const choices = o.choices;
    if (Array.isArray(choices) && choices.length) {
        return choices.map(extractTextFromStreamJson).join('');
    }
    return '';
}
function decodeSseDataPayload(raw) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '[DONE]')
        return '';
    const lines = trimmed.split('\n');
    let out = '';
    for (const line of lines) {
        const t = line.trim();
        if (!t || t === '[DONE]')
            continue;
        try {
            out += extractTextFromStreamJson(JSON.parse(t));
        }
        catch {
            out += t;
        }
    }
    return out;
}
//# sourceMappingURL=decodeFsAiSsePayload.js.map