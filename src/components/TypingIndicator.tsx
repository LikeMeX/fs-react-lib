import React from 'react';

const dotClass =
    'inline-block h-2 w-2 rounded-full bg-blackFS-300 motion-reduce:opacity-70 motion-safe:animate-bounce';

export const TypingIndicator: React.FC = () => (
    <div
        className="flex items-center gap-1 py-0.5"
        role="status"
        aria-live="polite"
        aria-label="กำลังพิมพ์">
        <span className="sr-only">กำลังพิมพ์</span>
        <span aria-hidden className={dotClass} />
        <span aria-hidden className={`${dotClass} [animation-delay:150ms]`} />
        <span aria-hidden className={`${dotClass} [animation-delay:300ms]`} />
    </div>
);
