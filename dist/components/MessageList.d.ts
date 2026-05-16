import React from 'react';
import { AssistantMessage } from '../types/learningAssistant';
export interface MessageListProps {
    messages: AssistantMessage[];
}
export declare const MessageList: React.FC<MessageListProps>;
