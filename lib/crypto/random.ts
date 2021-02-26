import { Encoder } from "../encoding/types";

/**
 * Generate a cryptographically strong random ID, uses `crypto.getRandomValues` under the hood.
 * 
 * @param entropy Entropy in bits, which will be rounded up to the nearest byte (i.e. multiple of 8).  
 * For secrets at least 128 bits is recommended.
 * @param encoder Encoder to use for transforming it into a string, optional.
 * 
 * **Example**
 * ```typescript
 * const myRandomId = await generateRandomId(128, base62);
 * console.log(myRandomId);
 * ```
 */
export function generateRandomToken(entropy: number, encoder: Encoder): string
export function generateRandomToken(entropy: number, encoder?: undefined): Uint8Array 
export function generateRandomToken(entropy: number, encoder?: Encoder): Uint8Array | string {
    if (entropy <= 0 || isNaN(entropy)) {
        throw new Error("The entropy of a random ID must be at least 1");
    }
    const entropyInBytes = Math.ceil(entropy / 8);
    const randomBytes = crypto.getRandomValues(new Uint8Array(entropyInBytes));

    if (encoder) {
        return encoder.encode(randomBytes)
    }
    return randomBytes;
}