# kit

[![CI](https://github.com/SunderJS/kit/workflows/CI/badge.svg)](https://github.com/SunderJS/kit/actions)
[![NPM badge](https://img.shields.io/npm/v/@sunder/kit)](https://www.npmjs.com/package/@sunder/kit)

Kit is a library of building blocks and utilities for Cloudflare Workers (CFW).

Functionality can be individually imported, so you can pick the parts you need without increasing your bundle size too much.

Some included modules are [**Sunder framework**](https://github.com/sunder/sunder)-specific, these are marked with 〽️. All others modules should be easy to use in any CFW project.

## What's included

### 🔌 Plug-and-play middlewares

* 🗂 **Static file serving** ([Cloudflare Sites](https://developers.cloudflare.com/workers/platform/sites)) 〽️
* 🐛 **Error logging** through Sentry. 〽️

### 👨‍💻 Session management
* 🍪 A cookie-based authentication system for keeping users logged in securely. By being backed by [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv) (or any other database) you can associate arbitrary data with a session, so there is little excuse for using JWT instead.

### 🕵️‍♀️ Crypto & Encoding/Decoding
* 🔏 Random token generation (cryptographically sound), use this to generate post IDs, user IDs or even secrets such as API tokens.
* 📦 Base64 encoding and decoding (RFC 3548 compliant)
* 🏷 [Base-X](https://www.npmjs.com/package/base-x) encoding and decoding, which can be used for encoding data or random IDs with a given alphabet. Example alphabets:
    * **Base 58** `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz` (does not contain `Il0O` for easier human copying)
    * **Base 62**
    `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ` (base64 without special characters)
    * **Base 36**
    `0123456789abcdefghijklmnopqrstuvwxyz` (all lowercase, useful for case-insensitive systems)
    
    > Warning: these encodings are not RFC3548 compliant. The padding is different, base-x uses Bitcoin's padding scheme.

### ⚡️ Node compatibility utils (100% local development)
Kit contains the building blocks to achieve Node compatibility fairly easily. This allows for local development and testing without Wrangler-in-the-loop. It contains

* 🚞 An [**Express**](https://expressjs.com) wrapper for Sunder which allows you to run Sunder apps in Node. Combine this with `nodemon` and you can have live-reload functionality. 〽️
* 🐠 Polyfills/mocks that make Node behave as closely to a Cloudflare Worker environment as possible.

#### Why is this important?
> * **Development velocity (live reload)**: instantly see your changes instead of uploading your code every time.
> * **A sane testing & CI story**: just use Jest or your other favorite Javascript testing framework.
> * **Self-hosting**: If your project is commercially succesful it is likely that one day you will need to run your Cloudflare Workers outside of Cloudflare's offering. A large enterprise client may pay a lot of $$$ to run your worker on their own servers.

## Installation
```
npm i @sunder/kit
```

## Documentation
👷‍♀️  Guides and long-form docs are to-do, use the Typescript typings as your guide for now.

The docs will live on [sunderjs.com](https://sunderjs.com).

## License
[MIT](./LICENSE)