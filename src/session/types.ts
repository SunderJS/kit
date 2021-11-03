import { Result } from "../common/types";

export interface SessionStore<SessionDataType> {
  /**
   * Insert a new session, returns the string token that should be embedded in a cookie.
   *
   * @param sessionKey A base62 encoded string, should be a long random value.
   * @param data Data that describes the session
   */
  createSession(data: SessionDataType): Promise<string>;
  getSession(sessionKey: string): Result<SessionDataType, "expired" | "invalid">;
  deleteSession(sessionKey: string): Promise<any>;
}

/**
 * Session metadata struct.
 */
export interface SessionExpirationData {
  /**
   * Milliseconds from epoch when this session is no longer valid.
   */
  session_expires_at: number;

  /**
   * Validity in seconds
   */
  session_max_age: number;
}
