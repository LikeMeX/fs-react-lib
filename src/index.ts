export * from './components';
export { default as AssistantContextProvider, AssistantContext, useAssistant } from './contexts/assistantContext';
export type { IAssistantContext } from './contexts/assistantContext';
export { configureFsAi, fsAiApi } from './services/fsAiApi';
export { useAssistantConversation } from './hooks/useAssistantConversation';
export { useAssistantPhase } from './hooks/useAssistantPhase';
export { useAssistantStream } from './hooks/useAssistantStream';
export {
    canUseLearningAssistant,
    isFsAiApiConfigured,
} from './helpers/canUseLearningAssistant';
export {
    ASSISTANT_HIDDEN_AUTH_PATHS,
    canShowAssistant,
    canShowLoggedInAssistant,
    isAssistantHiddenAuthPath,
} from './helpers/assistantAuthGate';
export { useAssistantVisibilityGate, useAssistantLoggedInGate } from './hooks/useAssistantVisibilityGate';
export { buildLearningMetadata } from './helpers/buildLearningMetadata';
export type { BuildLearningMetadataInput } from './helpers/buildLearningMetadata';
export {
    listAssistantConversations,
    upsertAssistantConversation,
    removeAssistantConversation,
    readAssistantFullPagePreference,
    writeAssistantFullPagePreference,
    ASSISTANT_HISTORY_STORAGE_KEY,
    ASSISTANT_FULL_PAGE_STORAGE_KEY,
} from './helpers/assistantConversationHistory';
export type { AssistantSurface, AssistantHistoryEntry } from './helpers/assistantConversationHistory';
export {
    readAssistantUserProfile,
    writeAssistantUserProfile,
    clearAssistantUserProfile,
    isAssistantUserProfileComplete,
} from './helpers/assistantUserProfile';
export type { AssistantUserProfile } from './helpers/assistantUserProfile';
export { userProfileOutToAssistant } from './helpers/assistantUserProfile';
export { onboardingApi } from './services/onboardingApi';
export type {
    OnboardingSession,
    OnboardingOutcome,
    UserEnsureResponse,
    UserProfileOut,
} from './services/onboardingApi';
export {
    isSkillpassOnboardingEnabled,
    oauthClaimsFromUserMember,
} from './helpers/oauthUserEnsure';
export type { OAuthEnsureClaims } from './helpers/oauthUserEnsure';
export { decodeSseDataPayload, extractTextFromStreamJson } from './helpers/decodeFsAiSsePayload';
export { filterDisplayableAssistantSources } from './helpers/filterAssistantSources';
export type { AssistantSource } from './helpers/filterAssistantSources';
export { sanitizeAssistantMarkdown, visibleStripped, isOrphanListMarkerLine } from './helpers/sanitizeAssistantMarkdown';
export * from './types/learningAssistant';
export { createFsAiProxyHandler } from './api-proxy/handler';
export type { CreateFsAiProxyHandlerOptions } from './api-proxy/handler';
