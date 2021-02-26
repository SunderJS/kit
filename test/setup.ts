/** Bootstrap test environment */
import {makeNodeWorkerEnvironment} from "../lib/compat/node/polyfill";
Object.assign(globalThis, makeNodeWorkerEnvironment());

if (!process.env.LISTENING_TO_UNHANDLED_REJECTIONS) {
    process.on("unhandledRejection", (reason) => {
      throw reason;
    });
    // Avoid memory leak by adding too many listeners
    (process.env as any).LISTENING_TO_UNHANDLED_REJECTIONS = true;
}