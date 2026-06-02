import React, { useEffect, useRef } from 'react';
import { AssistantMessage } from '../types/learningAssistant';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
    messages: AssistantMessage[];
    /** Rendered after the last bubble (e.g. chip choices under the current question). */
    footer?: React.ReactNode;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, footer }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, footer]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-1 py-2">
            {messages.map(m => (
                <MessageBubble key={m.id} message={m} />
            ))}
            {footer}
            <div ref={bottomRef} />
        </div>
    );
};
