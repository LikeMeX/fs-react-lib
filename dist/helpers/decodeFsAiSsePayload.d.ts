/**
 * Decode FS AI (and similar) SSE `data:` payloads where each line may be a JSON-encoded
 * string token (`"ย"`) or an object with `content` / `delta` / OpenAI-style `choices`.
 */
export declare function extractTextFromStreamJson(parsed: unknown): string;
export declare function decodeSseDataPayload(raw: string): string;
