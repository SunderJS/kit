interface SessionStoreOptions {
    /**
     * An identifier to be used in the cookie name, e.g. "magiclogin".
     */
    identifier: string;
    defaultMaxAgeInSeconds: number;
}

import { parse } from "cookie";
import { HttpStatus } from "sunder";
import { Result } from "../common/types";
import { SessionExpirationData, SessionStore } from "./types";

function isSecureRequest(request: Request) {
    return request.url.startsWith("https://");
}

/**
 * The SessionManager class wraps cookie-based authentication into an easy to use package.
 * You can use any data as your session data as long as it's a plain Javascript object
 * that is serializable with `JSON.stringify`. Normally you would put an object that contains some sort of *account_id*.
 */
export class SessionManager<SessionDataType> {
    private store: SessionStore<SessionDataType & Partial<SessionExpirationData>>;
    private opts: SessionStoreOptions;

    constructor(store: SessionStore<SessionDataType>, opts: SessionStoreOptions) {
        this.store = store;
        this.opts = opts;
    }

    private getCookieName(secure: boolean) {
        return secure ? `__Host-x-${this.opts.identifier}-session`: `x-${this.opts.identifier}-session`;
    }

    private getSetCookieHeaderValue(sessionToken: string, maxAge: number, secure: boolean) {
        return `${this.getCookieName(secure)}=${sessionToken}; HttpOnly; SameSite=strict; ${secure?"Secure; ":""}Max-Age=${maxAge}; Path=/`
    }
    
    private getDeleteSetCookieHeaderValue(secure: boolean) {
        return `${this.getCookieName(secure)}=""; HttpOnly; SameSite=strict; ${secure?"Secure; ":""}expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`
    }

    /**
     * Gets the session cookie from the request's headers.
     * 
     * This is exposed for testing purposes, you shouldn't need this in production.
     * @param request 
     */
    public getCookieValueFromRequest(request: Request) {    
        const ck = request.headers.get("Cookie")
        if (!ck) {
            return undefined;
        }
    
        const cookies = parse(ck);
        const sessionCookieValue = cookies[this.getCookieName(isSecureRequest(request))];
        return sessionCookieValue;
    }

    /**
     * Create a new session, it gets inserted into the store for later retrieval.
     * Note that the `expires_at` and `max_age` 
     * 
     * Returns the header value for Set-Cookie.
     * 
     * @param request Request which is only used to determine if the session is for https (secure) or not.
     * @param data
     * @param opts 
     */
    public async createSessionForRequest(request: Request, data: SessionDataType, opts: {maxAge?: number} = {}) {
        const maxAge = opts.maxAge ? opts.maxAge : this.opts.defaultMaxAgeInSeconds;
        const expiresAt = Date.now() + maxAge*1000;

        const sessionData: SessionDataType & SessionExpirationData = {
            ...data,
            session_expires_at: expiresAt,
            session_max_age: maxAge
        }

        const token = await this.store.createSession( sessionData)
        return this.getSetCookieHeaderValue(token, maxAge, isSecureRequest(request));
    }

    public async getSessionFromRequest(request: Request): Result<SessionDataType, "cookie_not_found" | "expired" | "invalid"> { 
        const sessionCookieValue = this.getCookieValueFromRequest(request);   
        if (!sessionCookieValue) {
            return {success: false, value: "cookie_not_found", status: HttpStatus.Unauthorized};
        }

        const r = await this.store.getSession(sessionCookieValue);
        if (r.success) {
            return r;
        } else {
            return {success: false, value: r.value, status: HttpStatus.Unauthorized};
        }
    }

    /**
     * Deletes the session for the given request, returns the Set-Cookie header value that will delete
     * any cookie present.
     * 
     * If the cookie for the given request was not found this header value is still returned, as it won't hurt to
     * set it anyway.
     * @param request
     */
    public async invalidateSessionFromRequest(request: Request) {
        const sessionCookieValue = this.getCookieValueFromRequest(request);
        if (!sessionCookieValue) {
            return this.getDeleteSetCookieHeaderValue(isSecureRequest(request))
        }

        await this.store.deleteSession(sessionCookieValue);
        return this.getDeleteSetCookieHeaderValue(isSecureRequest(request))
    }
}
