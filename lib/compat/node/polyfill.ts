// The tests run in Node, so we do our best to mock the Cloudflare Workers environment as best we can.
import { makeCloudflareWorkerEnv } from "cloudflare-worker-mock";
import { Crypto } from "@peculiar/webcrypto"

import fetch from "node-fetch";
import {Request as RequestNF, RequestInit as RequestInitNF} from "node-fetch"
import FormData from "formdata-node";

function headersToObject(h: Headers) {
  const obj: {[key:string]: string}= {};
  h.forEach((v, k) => {obj[k]=v})
  return obj;
}

/**
 * Polyfills a Node environment into a Cloudflare Workers-like environment by adding/overwriting global values.
 * 
 * In particular it polyfills the globals:
 * * `FormData`
 * * `window` (it just points to `globalThis`, for fixing browser packages that have window hardcoded).
 * * `fetch`
 * * `crypto`
 * 
 * And it has mocks for:
 * * `ReadableStream`
 * * `caches`
 * 
 * Usage:
 * ```
 * Object.assign(globalThis, makeNodeWorkerEnvironment())
 * ```
 */
export function makeNodeWorkerEnvironment() {
  return {
      window: globalThis,
      ...makeCloudflareWorkerEnv(),

      // Multiple "Request" polyfills tend to clash, this makes sure that node-fetch
      // version is used.
      fetch: (f: RequestInfo, x?: RequestInit) => {
        if (f instanceof Request) {
          return fetch(new RequestNF(f.url, {
            ...(f.body === null ? {} : {body: f.body as any}),
            headers: headersToObject(f.headers),
            method: f.method,
            redirect: f.redirect,
            signal: f.signal as any,
          }
          ))
        } else return fetch(f, x as RequestInitNF);

      },
      FormData: FormData,
      ReadableStream: class MockClass{},
      
      crypto: new Crypto(),
    }
};
