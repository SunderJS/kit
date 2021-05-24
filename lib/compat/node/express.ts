import express from "express";
import { Express } from "express";
import { Sunder } from "sunder";

interface ExpressWrapOptions {
  /**
   * The Express app to extend, by default a new Express app is created.
   */
  express?: Express;

  /**
   * Static serving options.
   * Express can serve files from a certain local filepath, one generally uses this to shadow
   * endpoints that normally return files from KV Asset Handler (through Cloudflare Sites).
   */
  static?: {
    route: string;
    filepath: string;
  };
}

/**
 * Wraps the given Sunder application in Express (a Node web framework).
 * This can then be used for local development, or if you or your clients want to run the code
 * on their own hardware.
 *
 * Of course Node and ServiceWorker environments are not the same, so make sure you polyfill adequately
 * before you call this function.
 *
 */
export function wrapAppInExpress(app: Sunder, opts: ExpressWrapOptions = {}): Express {
  const exApp = opts.express ?? express();

  if (opts.static) {
    exApp.use(
      opts.static.route,
      express.static(opts.static.filepath, {
        extensions: ["html"],
        redirect: true,
      })
    );
  }

  // This puts formdata in the body as an object
  exApp.use(express.urlencoded({ extended: false }));
  exApp.use(express.json());

  exApp.use(async (req, res, next) => {
    const headers = new Headers(req.headers as any);
    const url = req.protocol + "://" + req.get("host") + req.originalUrl;

    const request = new Request(url, {
      ...(req.method !== "GET" && req.method !== "HEAD" ? { body: req.body } : {}),
      headers,
      method: req.method,
    });

    request.text = () => Promise.resolve(JSON.stringify(req.body));
    request.formData = async () => {
      const fd = new FormData();
      Object.entries(req.body).forEach(([k, v]) => fd.set(k, v as string));
      return fd;
    };

    const fe = new FetchEvent("fetch", { request });

    // We set the request again as the FetchEvent polyfill may have their own
    // request type, leading to subtle bugs.
    (fe as any).request = request;

    // A promise chain is used for fetchevent.waitUntil
    let prom: Promise<unknown> = Promise.resolve(); // Promise chain
    fe.waitUntil = (p: Promise<unknown>) => {
      prom = Promise.all([prom, p]);
    };

    const response = await app.handle(fe);

    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));

    if (response.body !== null) {
      res.send(await response.text());
    } else {
      res.send();
    }

    await next();
    await prom;
  });
  return exApp;
}
