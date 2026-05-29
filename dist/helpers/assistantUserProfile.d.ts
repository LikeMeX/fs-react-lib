/** Persists assistant personalization profile in localStorage. Survives reloads, scoped per browser. */
import { UserProfileOut } from '../services/onboardingApi';
export interface AssistantUserProfile {
    current_job: string;
    target_job: string;
    industry: string;
    timeframe: string;
    skill_level?: string;
}
export declare function readAssistantUserProfile(): AssistantUserProfile | null;
export declare function writeAssistantUserProfile(profile: AssistantUserProfile): void;
export declare function clearAssistantUserProfile(): void;
/** Map server legacy profile columns to local assistant metadata shape. */
export declare function userProfileOutToAssistant(profile: UserProfileOut | null | undefined): AssistantUserProfile | null;
export declare function isAssistantUserProfileComplete(profile: AssistantUserProfile | null): boolean;
