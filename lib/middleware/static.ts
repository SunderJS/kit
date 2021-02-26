import { getAssetFromKV, Options } from "@cloudflare/kv-asset-handler";
import { Context, MiddlewareNextFunction } from "sunder";

/**
 * Returns a middleware that serves files from (Cloudflare Sites) KV.
 * This can only be used on a route that contains a `kvAssetPath` route param, see the example below.
 * 
 * @param options see kv-asset-handler's options.
 * 
 * **Example**
 * 
 * ```typescript
 * const router = new Router();
 * router.get("/static/:kvAssetPath+", serveStaticAssetsFromKV())
 * router.head("/static/:kvAssetPath+", serveStaticAssetsFromKV())
 * ```
 * 
 */
export function serveStaticAssetsFromK(options: Partial<Options> = {}) {
    return async function (ctx: Context<{ kvAssetPath: string }>, next: MiddlewareNextFunction) {
        try {
            const resp = await getAssetFromKV(
                (ctx as any).event,
                {
                    mapRequestToAsset: (req: Request) => new Request(ctx.url.origin + "/" + ctx.params.kvAssetPath, req),
                    ...options
                }
            );
            if (resp.body !== null) {
                ctx.response.body = resp.body;
            };
            ctx.response.headers = resp.headers;
            ctx.response.status = resp.status;
            ctx.response.statusText = resp.statusText;
        } catch (e) {
            let pathname = ctx.url.pathname;
            ctx.throw(404, `${pathname} not found`);
        }
        await next();
    }
}
