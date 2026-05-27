/** Auth routes where the learning assistant must stay hidden. */
export const ASSISTANT_HIDDEN_AUTH_PATHS = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dev-login',
    '/liff/line-crm/login',
    '/liff/line-crm/info/register',
    '/liff/line-crm/info/forgot-password',
    '/liff/line-crm/info/reset-password',
] as const;

export function isAssistantHiddenAuthPath(pathname: string): boolean {
    const path = pathname.split('?')[0];
    return ASSISTANT_HIDDEN_AUTH_PATHS.some(route => path === route || path.startsWith(`${route}/`));
}

/**
 * Controls when the global assistant shell is visible.
 *
 * - `requireAuth` (default `true`): fs-main — logged-in users only.
 * - `requireAuth: false`: fs-ecommerce — guests may use chat, still hidden on auth routes.
 */
export function canShowAssistant(args: {
    pathname: string;
    isLoggedIn?: boolean;
    requireAuth?: boolean;
}): boolean {
    if (isAssistantHiddenAuthPath(args.pathname)) return false;
    if (args.requireAuth !== false && !args.isLoggedIn) return false;
    return true;
}

/** @deprecated Use `canShowAssistant` */
export function canShowLoggedInAssistant(args: { isLoggedIn: boolean; pathname: string }): boolean {
    return canShowAssistant({ ...args, requireAuth: true });
}
