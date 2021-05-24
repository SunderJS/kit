import { Sentry as BorderlessSentry, CaptureExceptionOptions } from "@borderless/worker-sentry";
import { headersToObject } from "../common/util";
import { Context } from "sunder";
import { isHttpError } from "sunder/util/error";

export interface SentryMiddlewareOptions<ParamsType, StateType> {
  /**
   * Headers to remove from logging, defaults to `"cookie"` and `"authorization"`.
   */
  hideHeaders: string[];

  /** A function that calculates the user ID from the context. */
  getUserId?: (ctx: Context<ParamsType, StateType>) => string;

  /**
   * An optional function that can be used to add extra tags to the error
   */
  getExtraTags?: (ctx: Context<ParamsType, StateType>) => Record<string, string>;

  /**
   * Function that can be run on errors to optionally ignore them
   */
  ignore: (error: Error | any, ctx: Context<ParamsType, StateType>) => boolean;
}

/**
 * Simple Sentry client that uses Fetch internally and provides a Sunder middleware.
 *
 * This class an extension of the Sentry class from the  @borderless/worker-sentry package with a
 * workaround for Node's FormData polyfill peculiarities.
 *
 */
export class Sentry extends BorderlessSentry {
  private environment?: string;
  private release?: string;
  private serverName?: string;

  constructor(dsn: string, opts: { environment?: string; release?: string; serverName?: string } = {}) {
    super({
      dsn,
      fetch: (r) => {
        // Polyfill for weird node fetch FormData polyfill.
        const b: any = r.body;
        if (b.parts) {
          (r as any).body = b.parts[0];
        }
        return fetch(r);
      },
    });

    this.environment = opts.environment;
    this.release = opts.release;
    this.serverName = opts.serverName;
  }

  /**
   * This middleware catches and logs errors to Sentry, and rethrows afterwards.
   *
   * By default it ignores HTTP errors that are non-500, this can be overriden by providing your own `ignore` function.
   */
  getMiddleware<ParamsType = {}, StateType = any>(
    options: Partial<SentryMiddlewareOptions<ParamsType, StateType>> = {}
  ) {
    const optionsDefinite: SentryMiddlewareOptions<ParamsType, StateType> = Object.assign(
      {
        hideHeaders: ["cookies", "authorization"],
        ignore: (err: any, _ctx: any) => {
          if (isHttpError(err) && err.status.toString()[0] !== "5") {
            return true;
          }
          return false;
        },
      },
      options
    );

    return async (ctx: Context<ParamsType, StateType>, next: Function) => {
      try {
        await next();
      } catch (e) {
        if (options.ignore && options.ignore(e, ctx)) {
          throw e; //re-throw without logging
        }

        const severity = "error";
        const req = ctx.request;
        const headers = new Headers(req.headers);
        for (const h of optionsDefinite.hideHeaders) {
          headers.delete(h);
        }

        const opts: CaptureExceptionOptions = {
          environment: this.environment,
          release: this.release,
          serverName: this.serverName,
          level: severity,
          user: options.getUserId ? { id: options.getUserId(ctx) } : undefined,
          tags: {
            server_time: new Date().toISOString(),
            ...(options.getExtraTags ? options.getExtraTags(ctx) : {}),
          },
          request: {
            method: ctx.request.method,
            url: ctx.request.url,
            headers: headersToObject(headers),
          },
        };

        const respPromise = this.captureException(e, opts);
        ctx.waitUntil(respPromise);
        throw e;
      }
    };
  }
}
