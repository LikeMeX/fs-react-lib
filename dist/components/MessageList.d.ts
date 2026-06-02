import React from 'react';
import { AssistantMessage } from '../types/learningAssistant';
export interface MessageListProps {
    messages: AssistantMessage[];
    /** Rendered after the last bubble (e.g. chip choices under the current question). */
    footer?: React.ReactNode;
}
export declare const MessageList: React.FC<MessageListProps>;
