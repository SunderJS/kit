/**
 * Thin wrapper around `crypto.subtle.digest` that returns a Uint8Array instead of an ArrayBuffer.
 * @param value
 */
export async function sha256(value: Uint8Array) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", value));
}
