# kit

Kit is a library of building blocks and utilities for Cloudflare Workers (CFW).

Functionality can be individually imported, so you can pick the parts you need without increasing your bundle size too much.

Some included modules are intended for use with the [**Sunder framework**](https://github.com/sunder/sunder) framework, these are marked with 〽️. All others modules should be easy to use in any CFW project.

## 🔋 What's included

### ⚡️ Node compatibility utils (100% local development)
Sunder Kit contains the building blocks to achieve Node compatability fairly easily. This allows for local development and testing without Wrangler-in-the-loop. It contains

* 🎁 An [**Express**](https://expressjs.com) wrapper for Sunder which allows you to run Sunder apps in Node. Combine this with `nodemon` and you can have live-reload functionality. 〽️
* 🧩 Polyfills/mocks that make Node behave as closely to a Cloudflare Worker environment as possible.

> **Why is this important?**  
> * Development velocity: instantly see your changes instead of uploading your code every time.
> * Easier testing & CI story: just use Jest on a plain machine.
> * Self-hosting: If your project is commercially succesful it is likely that one day you will need to run your Cloudflare Workers outside of Cloudflare's  offering. A large enterprise client will pay a lot of $$$ to run your code on their own servers.

### 🔌 Plug-and-play middlewares

* 🗂 **Static file serving (Cloudflare Sites)** for serving static files through KV Asset Handler (generally this would be the assets added through [Cloudflare Sites](https://developers.cloudflare.com/workers/platform/sites)) 〽️
* 🐛 **Error logging** through Sentry. 〽️

### 👨‍💻 Session management
Cookies are a simple and secure way to keep users logged in.

Combined with [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv) (or any other database) there is really no more reason to mess with JWT tokens.


### 🚀 Common utilities
* 🏷 [Base-X](https://www.npmjs.com/package/base-x) encoding and decoding, which can be used for encoding data or generating random IDs with a given alphabet. Example alphabets:
    * **Base 58** `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz` (does not contain `Il0O` for easier human copying)
    * **Base 62**
    `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ` (base64 without special characters)
    * **Base 36**
    `0123456789abcdefghijklmnopqrstuvwxyz` (all lowercase, useful for case-insensitive systems)
    
    > Warning: not RFC3548 compliant. Use a different package for base16, base32 or base64 if the data leaves your system. The padding is different, this package uses Bitcoin's padding scheme.
* 📦 Base64 encoding and decoding (RFC 3548 compliant)
* 🔏 Random token generation (cryptographically strong), use this to generate post IDs, user IDs or even secrets such as API tokens.

## Installation
```
npm i sunder-kit
```

## Documentation

Guides and long-form docs are to-do, use the Typescript typings and comments for now.. will live on [sunderjs.com](https://sunderjs.com).

## License
[MIT](./LICENSE)