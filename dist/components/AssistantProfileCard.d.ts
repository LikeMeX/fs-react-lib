import React from 'react';
import { AssistantUserProfile } from '../helpers/assistantUserProfile';
export interface AssistantProfileCardProps {
    profile: AssistantUserProfile;
    summary?: string | null;
    onEdit: () => void;
}
export declare const AssistantProfileCard: React.FC<AssistantProfileCardProps>;
