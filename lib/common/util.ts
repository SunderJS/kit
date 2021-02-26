/**
 * Transforms a Headers object into a plain object that maps from
 * string to string.
 * 
 * Works for both Webworker and Node-style Header objects.
 */
export function headersToObject(headers: Headers): Record<string, string> {
    const hObject: Record<string, string> = {};

    if (headers.forEach) { // Webworker headers
        headers.forEach((v, k) => hObject[k] = v);
    } else {
        for (const [k,v] of (headers as any).entries()) { // Node-style headers
            hObject[k] = v;
        }
    }
    return hObject;
}