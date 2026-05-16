"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAssistantStream = useAssistantStream;
const react_1 = require("react");
const decodeFsAiSsePayload_1 = require("../helpers/decodeFsAiSsePayload");
const filterAssistantSources_1 = require("../helpers/filterAssistantSources");
const fsAiApi_1 = require("../services/fsAiApi");
function processSseBlock(block, onEvent) {
    let eventName = 'message';
    const dataLines = [];
    for (const line of block.split('\n')) {
        if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
        }
        else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
        }
    }
    if (dataLines.length) {
        const joined = dataLines.join('\n');
        const payload = eventName === 'meta' ? joined : (0, decodeFsAiSsePayload_1.decodeSseDataPayload)(joined);
        onEvent(eventName, payload);
    }
}
function appendSseToBuffer(buffer, chunk, onBlock) {
    let next = buffer + chunk;
    let idx;
    while ((idx = next.indexOf('\n\n')) !== -1) {
        const block = next.slice(0, idx);
        next = next.slice(idx + 2);
        if (block.trim())
            onBlock(block);
    }
    return next;
}
function useAssistantStream() {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [suggestedActions, setSuggestedActions] = (0, react_1.useState)([]);
    const [streaming, setStreaming] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const abortRef = (0, react_1.useRef)(null);
    const seenIdsRef = (0, react_1.useRef)(new Set());
    const abort = (0, react_1.useCallback)(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);
    const send = (0, react_1.useCallback)(async (conversationId, body) => {
        abort();
        const ac = new AbortController();
        abortRef.current = ac;
        setStreaming(true);
        setSuggestedActions([]);
        setError(null);
        const assistantId = `a-${Date.now()}`;
        setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: body.message }]);
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);
        const url = fsAiApi_1.fsAiApi.streamMessagesUrl(conversationId);
        const init = fsAiApi_1.fsAiApi.buildStreamInit(conversationId, body);
        let response;
        try {
            response = await fetch(url, { ...init, signal: ac.signal });
        }
        catch (e) {
            setError(e?.message || 'Network error');
            setStreaming(false);
            return;
        }
        if (!response.ok || !response.body) {
            let detail = '';
            try {
                detail = await response.text();
            }
            catch {
                /* ignore */
            }
            const msg = `FS AI ${response.status}: ${detail || response.statusText}`;
            // eslint-disable-next-line no-console
            console.error('[useAssistantStream]', msg, { url, body });
            setError(msg);
            setStreaming(false);
            return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantText = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer = appendSseToBuffer(buffer, decoder.decode(value, { stream: true }), block => {
                    processSseBlock(block, (eventName, data) => {
                        if (eventName === 'meta') {
                            try {
                                const meta = JSON.parse(data);
                                if (meta.message_id && seenIdsRef.current.has(meta.message_id))
                                    return;
                                if (meta.message_id)
                                    seenIdsRef.current.add(meta.message_id);
                                if (meta.suggested_actions?.length) {
                                    setSuggestedActions(meta.suggested_actions);
                                }
                                setMessages(prev => {
                                    const copy = [...prev];
                                    const i = copy.findIndex(m => m.id === assistantId);
                                    if (i >= 0) {
                                        const sources = (0, filterAssistantSources_1.filterDisplayableAssistantSources)(meta.sources);
                                        if (sources?.length) {
                                            copy[i] = { ...copy[i], sources };
                                        }
                                    }
                                    return copy;
                                });
                            }
                            catch {
                                /* ignore malformed meta */
                            }
                        }
                        else {
                            assistantText += data;
                            setMessages(prev => {
                                const copy = [...prev];
                                const i = copy.findIndex(m => m.id === assistantId);
                                if (i >= 0)
                                    copy[i] = { ...copy[i], content: assistantText };
                                return copy;
                            });
                        }
                    });
                });
            }
            buffer += decoder.decode();
            if (buffer.trim()) {
                processSseBlock(buffer, (eventName, data) => {
                    if (eventName !== 'meta')
                        assistantText += data;
                });
                setMessages(prev => {
                    const copy = [...prev];
                    const i = copy.findIndex(m => m.id === assistantId);
                    if (i >= 0)
                        copy[i] = { ...copy[i], content: assistantText };
                    return copy;
                });
            }
        }
        finally {
            setStreaming(false);
        }
    }, [abort]);
    const reset = (0, react_1.useCallback)(() => {
        abort();
        setMessages([]);
        setSuggestedActions([]);
        seenIdsRef.current = new Set();
    }, [abort]);
    return { messages, setMessages, suggestedActions, streaming, error, send, abort, reset };
}
//# sourceMappingURL=useAssistantStream.js.map