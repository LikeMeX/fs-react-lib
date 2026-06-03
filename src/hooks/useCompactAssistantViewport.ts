import { useEffect, useState } from 'react';

/** Match Tailwind `md` — side panel layout only at 768px and up. */
export const ASSISTANT_COMPACT_VIEWPORT_QUERY = '(max-width: 767px)';

export function useCompactAssistantViewport(): boolean {
    const [compact, setCompact] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia(ASSISTANT_COMPACT_VIEWPORT_QUERY);
        const sync = () => setCompact(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    return compact;
}
