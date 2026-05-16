export type AssistantSource = { title?: string; url?: string };

export function filterDisplayableAssistantSources(
    sources: AssistantSource[] | undefined
): AssistantSource[] | undefined {
    if (!sources?.length) return undefined;
    const out = sources.filter(s => {
        const t = (s.title ?? '').trim();
        const u = (s.url ?? '').trim();
        return t.length > 0 || u.length > 0;
    });
    return out.length ? out : undefined;
}
