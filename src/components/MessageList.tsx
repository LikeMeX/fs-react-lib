import React, { useEffect, useRef } from 'react';
import { AssistantMessage } from '../types/learningAssistant';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
    messages: AssistantMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-1 py-2">
            {messages.map(m => (
                <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};
