import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/** How the host authenticates FS AI calls. */
export interface FsAiAuthOptions {
    /** The token to send now. Read on every request, so a renewed token is picked up. */
    getToken: () => string | null | undefined;
    /**
     * Called when FS AI (or the host's proxy) answers 401: renew the session and resolve `true`
     * once `getToken` returns the new token, or `false` when it cannot be renewed (the host
     * handles that, e.g. by sending the user to log in). The refused call is then sent once more.
     * Reject only for an unexpected failure; it reaches the caller instead of the 401.
     */
    onUnauthorized?: () => Promise<boolean>;
}

let auth: FsAiAuthOptions = { getToken: () => null };
let renewal: Promise<boolean> | null = null;

export function setFsAiAuth(options: FsAiAuthOptions): void {
    auth = options;
    renewal = null;
}

export function currentFsAiToken(): string | null | undefined {
    return auth.getToken();
}

/**
 * Ask the host to renew its token. Calls refused together share one renewal, so a session with
 * several FS AI calls in flight renews once.
 */
export function renewFsAiToken(): Promise<boolean> {
    const renew = auth.onUnauthorized;
    if (!renew) return Promise.resolve(false);
    if (!renewal) {
        renewal = renew()
            .then(renewed => renewed === true)
            .finally(() => {
                renewal = null;
            });
    }
    return renewal;
}

type RenewableConfig = InternalAxiosRequestConfig & { fsAiRenewed?: boolean };

/** Send every request with the current token, and resend one refused with 401 after renewal. */
export function authenticateFsAiClient(client: AxiosInstance): AxiosInstance {
    client.interceptors.request.use(config => {
        const token = currentFsAiToken();
        if (token && config.headers) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        return config;
    });
    client.interceptors.response.use(undefined, async error => {
        const config = (axios.isAxiosError(error) ? error.config : undefined) as RenewableConfig | undefined;
        if (!config || config.fsAiRenewed || error.response?.status !== 401) throw error;
        if (!(await renewFsAiToken())) throw error;
        config.fsAiRenewed = true;
        return client.request(config);
    });
    return client;
}
