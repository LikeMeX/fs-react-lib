import { AssistantUserProfile } from './assistantUserProfile';
export interface ProfileDisplayRow {
    label: string;
    value: string;
}
export declare function hasDisplayableAssistantProfile(profile: AssistantUserProfile | null | undefined): boolean;
export declare function assistantProfileDisplayRows(profile: AssistantUserProfile): ProfileDisplayRow[];
