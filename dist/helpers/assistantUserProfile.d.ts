/** Persists assistant personalization profile in localStorage. Survives reloads, scoped per browser. */
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
export declare function isAssistantUserProfileComplete(profile: AssistantUserProfile | null): boolean;
//# sourceMappingURL=assistantUserProfile.d.ts.map