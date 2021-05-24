import { CloudflareWorkerKV } from "types-cloudflare-worker";
import { base62 } from "../encoding/baseX";
import { HttpStatus } from "sunder";
import { sha256 } from "../crypto/hash";
import { SessionExpirationData, SessionStore } from "../session/types";
import { Result } from "../common/types";
import { generateRandomToken } from "../crypto/random";

/**
 * A prefix added to KV entries for sessions, to make sure we don't clash with potential other data,
 * and also allow for easy prefixing if for some reason we want to list all current sessions..
 */
const SESSION_KEY_PREFIX = "SUNDER_KIT_SESSION_";

async function tokenToHashStringBase62(token: string) {
  const tokenBytes = base62.decode(token);
  const tokenHash = await sha256(tokenBytes);
  return base62.encode(tokenHash);
}

function generateSessionToken() {
  // 196 bits of entropy makes it unguessable
  return generateRandomToken(196, base62);
}

/**
 * A store based on Cloudflare Workers KV.
 *
 * It implements the SessionStore interface, sessions are stored using a fast one-way hash, if session tokens
 * contain enough entropy (e.g. >128 bits) this means that even if an attacker got read-only access to the KV values,
 * they still could not guess a token and use it to impersonate a user.
 */
export class KVStore<SessionType> implements SessionStore<SessionType> {
  kv: CloudflareWorkerKV;

  constructor(kv: CloudflareWorkerKV) {
    this.kv = kv;
  }

  async createSession(data: SessionType & SessionExpirationData): Promise<any> {
    const hashString = await tokenToHashStringBase62(generateSessionToken());

    // Note: The expiration is set longer than max age as a courtesy, the cookie itself is configured to expire in the
    // browser, but still if we ever get a very old cookie we can tell the user it expired instead of saying it's invalid.
    await this.kv.put(SESSION_KEY_PREFIX + hashString, JSON.stringify(data), {
      expirationTtl: data.session_max_age * 4,
    });
  }

  async getSession(sessionToken: string): Result<SessionType & SessionExpirationData, "expired" | "invalid"> {
    let hashString: string;
    try {
      hashString = await tokenToHashStringBase62(sessionToken);
    } catch (e) {
      // Failed to decode which can only happen if someone makes up a cookie value themselves.
      return { success: false, status: HttpStatus.Unauthorized, value: "invalid" };
    }

    const entry: SessionType & SessionExpirationData = await this.kv.get(SESSION_KEY_PREFIX + hashString, "json");
    if (entry === null) {
      return { success: false, status: HttpStatus.Unauthorized, value: "invalid" };
    }

    if (Date.now() > entry.session_expires_at) {
      return { success: false, status: HttpStatus.Unauthorized, value: "expired" };
    }

    return { success: true, value: entry };
  }

  async deleteSession(sessionToken: string): Promise<void> {
    const hashString = await tokenToHashStringBase62(sessionToken);
    await this.kv.delete(SESSION_KEY_PREFIX + hashString);
  }
}
