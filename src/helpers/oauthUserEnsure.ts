import { AssistantUserMember } from '../types/learningAssistant';

export interface OAuthEnsureClaims {
    provider: string;
    provider_user_id: string;
    email?: string;
    name?: string;
    avatar_url?: string;
}

/** Map host app JWT / userMember to fs-ai OAuth ensure body (same shape as Chainlit). */
export function oauthClaimsFromUserMember(
    userMember: AssistantUserMember
): OAuthEnsureClaims | null {
    if (!userMember || typeof userMember !== 'object') return null;
    const u = userMember as Record<string, unknown>;

    const provider =
        (typeof u.oauth_provider === 'string' && u.oauth_provider) ||
        (typeof u.provider === 'string' && u.provider) ||
        'futureskill';

    const providerUserId =
        (typeof u.oauth_provider_user_id === 'string' && u.oauth_provider_user_id) ||
        (typeof u.sub === 'string' && u.sub) ||
        (typeof u.id === 'string' && u.id) ||
        (typeof u.user_id === 'string' && u.user_id) ||
        (typeof u.userId === 'string' && u.userId) ||
        (typeof u.memberId === 'string' && u.memberId) ||
        (typeof u.member_id === 'string' && u.member_id) ||
        (typeof u.id === 'number' && String(u.id)) ||
        null;

    if (!providerUserId) return null;

    const email =
        (typeof u.email === 'string' && u.email) ||
        (typeof u.preferred_username === 'string' && u.preferred_username) ||
        undefined;
    const name =
        (typeof u.name === 'string' && u.name) ||
        (typeof u.displayName === 'string' && u.displayName) ||
        (typeof u.firstName === 'string' && u.firstName) ||
        undefined;
    const avatar_url =
        (typeof u.avatar_url === 'string' && u.avatar_url) ||
        (typeof u.picture === 'string' && u.picture) ||
        undefined;

    return {
        provider,
        provider_user_id: providerUserId,
        email,
        name,
        avatar_url,
    };
}

export function isSkillpassOnboardingEnabled(): boolean {
    if (typeof process === 'undefined') return true;
    return process.env.NEXT_PUBLIC_SKILLPASS_ONBOARDING !== 'false';
}
