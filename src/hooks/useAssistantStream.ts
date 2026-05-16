import { useCallback, useRef, useState } from 'react';
import { decodeSseDataPayload } from '../helpers/decodeFsAiSsePayload';
import { filterDisplayableAssistantSources } from '../helpers/filterAssistantSources';
import { AssistantMessage, StreamMetaPayload, SuggestedAction } from '../types/learningAssistant';
import { fsAiApi } from '../services/fsAiApi';

function processSseBlock(block: string, onEvent: (eventName: string, data: string) => void) {
    let eventName = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
        if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
        }
    }
    if (dataLines.length) {
        const joined = dataLines.join('\n');
        const payload = eventName === 'meta' ? joined : decodeSseDataPayload(joined);
        onEvent(eventName, payload);
    }
}

function appendSseToBuffer(buffer: string, chunk: string, onBlock: (block: string) => void): string {
    let next = buffer + chunk;
    let idx: number;
    while ((idx = next.indexOf('\n\n')) !== -1) {
        const block = next.slice(0, idx);
        next = next.slice(idx + 2);
        if (block.trim()) onBlock(block);
    }
    return next;
}

export function useAssistantStream() {
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    const abort = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    const send = useCallback(
        async (conversationId: string, body: Parameters<typeof fsAiApi.buildStreamInit>[1]) => {
            abort();
            const ac = new AbortController();
            abortRef.current = ac;
            setStreaming(true);
            setSuggestedActions([]);
            setError(null);

            const assistantId = `a-${Date.now()}`;
            setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: body.message }]);
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

            const url = fsAiApi.streamMessagesUrl(conversationId);
            const init = fsAiApi.buildStreamInit(conversationId, body);
            let response: Response;
            try {
                response = await fetch(url, { ...init, signal: ac.signal });
            } catch (e) {
                setError((e as Error)?.message || 'Network error');
                setStreaming(false);
                return;
            }

            if (!response.ok || !response.body) {
                let detail = '';
                try {
                    detail = await response.text();
                } catch {
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
                    if (done) break;
                    buffer = appendSseToBuffer(buffer, decoder.decode(value, { stream: true }), block => {
                        processSseBlock(block, (eventName, data) => {
                            if (eventName === 'meta') {
                                try {
                                    const meta = JSON.parse(data) as StreamMetaPayload;
                                    if (meta.message_id && seenIdsRef.current.has(meta.message_id)) return;
                                    if (meta.message_id) seenIdsRef.current.add(meta.message_id);
                                    if (meta.suggested_actions?.length) {
                                        setSuggestedActions(meta.suggested_actions);
                                    }
                                    setMessages(prev => {
                                        const copy = [...prev];
                                        const i = copy.findIndex(m => m.id === assistantId);
                                        if (i >= 0) {
                                            const sources = filterDisplayableAssistantSources(meta.sources);
                                            if (sources?.length) {
                                                copy[i] = { ...copy[i], sources };
                                            }
                                        }
                                        return copy;
                                    });
                                } catch {
                                    /* ignore malformed meta */
                                }
                            } else {
                                assistantText += data;
                                setMessages(prev => {
                                    const copy = [...prev];
                                    const i = copy.findIndex(m => m.id === assistantId);
                                    if (i >= 0) copy[i] = { ...copy[i], content: assistantText };
                                    return copy;
                                });
                            }
                        });
                    });
                }
                buffer += decoder.decode();
                if (buffer.trim()) {
                    processSseBlock(buffer, (eventName, data) => {
                        if (eventName !== 'meta') assistantText += data;
                    });
                    setMessages(prev => {
                        const copy = [...prev];
                        const i = copy.findIndex(m => m.id === assistantId);
                        if (i >= 0) copy[i] = { ...copy[i], content: assistantText };
                        return copy;
                    });
                }
            } finally {
                setStreaming(false);
            }
        },
        [abort]
    );

    const reset = useCallback(() => {
        abort();
        setMessages([]);
        setSuggestedActions([]);
        seenIdsRef.current = new Set();
    }, [abort]);

    return { messages, setMessages, suggestedActions, streaming, error, send, abort, reset };
}
