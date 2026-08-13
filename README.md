# MidasLookup — PUBG Mobile Player Lookup

MidasLookup is a React interface for looking up a PUBG Mobile player name by Player ID. The production architecture is browser-friendly but keeps the Midasbuy request and Chaos VM signing logic server-side in a Netlify Function.

## Architecture

```text
React browser
  ├─ numeric Player ID validation
  ├─ duplicate-submit prevention
  ├─ five-minute browser cache for successful results
  └─ GET /api/query?id=<player-id>
          │
          ▼
Netlify Function: netlify/functions/query.mjs
  ├─ input validation and lightweight per-instance rate limiting
  ├─ fresh Midasbuy token retrieval
  ├─ server-side Chaos VM encryption
  ├─ POST request to Midasbuy getCharac
  ├─ five-minute warm-instance cache
  └─ normalized JSON response
```

The browser never receives `xmidas_real.js`, Midasbuy cookies, signing tokens, or the raw request construction. It only receives the normalized player result. This keeps the sensitive integration logic out of the public JavaScript bundle and avoids requiring a local Python API server after deployment.

## Project structure

```text
client/
  src/
    pages/Home.tsx                 # UI, validation, cache, and function call
netlify/
  functions/
    query.mjs                      # Browserless Midasbuy lookup function
    xmidas_real.js                 # Required Chaos VM bundle
netlify.toml                       # Netlify build and routing settings
package.json                       # React and serverless dependencies
```

## Requirements

Node.js 22 or a currently supported Netlify Node.js runtime is recommended. The project uses `pnpm`, but npm can also run the equivalent scripts. A Netlify account and a Git repository or ZIP containing this project are required for deployment.

## Run the frontend locally

Install dependencies and start the Vite development server:

```bash
pnpm install
pnpm run dev
```

Before starting, confirm that both server-side files exist in the copied project:

```text
netlify/functions/query.mjs
netlify/functions/xmidas_real.js
```

On Windows CMD, check them with:

```cmd
dir netlify\functions\query.mjs
dir netlify\functions\xmidas_real.js
```

Do not copy only the `client` folder. The `netlify` folder is required for local and production lookup.

The frontend opens on the Vite development URL, and the project mounts the same `/api/query?id=<player-id>` contract into plain Vite so the complete React-to-function lookup can be tested locally without the old Python API.

Plain `pnpm run dev` intentionally runs without Netlify's redirect middleware. This avoids a known local URI-decoding crash when malformed percent-encoded URLs are received by that middleware, particularly on Windows paths. A small Vite middleware invokes the same function handler directly, so `/api/query` works locally. If the required files are missing, the route returns a clear setup error instead of an opaque module-import stack trace.

## Test the function locally

The function handler is importable as a normal Node.js module. A one-time smoke-test file can call it with the verified sample ID:

```js
import { handler } from './netlify/functions/query.mjs';

const result = await handler({
  httpMethod: 'GET',
  headers: { 'x-forwarded-for': '127.0.0.1' },
  queryStringParameters: { id: '5333302466' },
});

console.log(result.statusCode, JSON.parse(result.body));
```

Expected successful data is shaped like:

```json
{
  "success": true,
  "player_id": "5333302466",
  "name": "I'ｍＧｒｏｏｔ",
  "openid": "20445891366618408",
  "zoneid": "1"
}
```

The actual project includes `test-netlify-function.mjs` for this smoke test. It is intended for verification only and can be removed before publishing if desired.

For full local function routing, install or invoke the Netlify CLI and run:

```bash
npx netlify-cli dev
```

Then open the local Netlify URL, usually `http://localhost:8888`. The production deployment does not require either local command to remain running.

## Deploy to Netlify

1. Push the project root to GitHub, GitLab, or Bitbucket. The repository root must contain `netlify.toml`, `netlify/`, `client/`, and `package.json`.
2. In Netlify, select **Add new project** and import the repository.
3. Keep the base directory empty unless the repository contains this project in a subdirectory.
4. Netlify will read `netlify.toml`. The effective settings are:

   | Setting | Value |
   |---|---|
   | Build command | `pnpm run build` |
   | Publish directory | `dist/public` |
   | Functions directory | `netlify/functions` |
   | Node version | `22` |

5. Start the deployment. After deployment, the React app calls `/api/query?id=5333302466` on the same Netlify site.
6. Verify the function directly at `/.netlify/functions/query?id=5333302466` if needed. The cleaner `/api/query` route is configured in `netlify.toml`.

No local `midas_api.py` process is needed for the deployed site. The local Python API remains useful only if you want to keep an independent development backend outside Netlify.

## Frontend request contract

The UI sends a same-origin GET request:

```http
GET /api/query?id=5333302466
Accept: application/json
```

A successful response has `success: true` and includes `player_id`, `name`, `openid`, and `zoneid`. Invalid IDs return HTTP 400. Too many requests from the same observed client key return HTTP 429. Temporary Midasbuy or function failures return HTTP 502 with a generic message so upstream implementation details are not exposed to the browser.

## Client-side load reduction

The browser validates that a Player ID contains 6–20 digits before making a request. The submit button is disabled while a lookup is in progress, successful results are stored in `localStorage` for five minutes, and cached results are shown without another Midasbuy request.

The cache is intentionally short-lived because player names can change. It is a convenience optimization, not a permanent database. Private browsing modes or storage restrictions are supported; the live lookup still works when local storage is unavailable.

## Server-side protection

The function applies a lightweight in-memory limit of 20 requests per observed client key per minute and caches successful lookups for five minutes while the serverless instance remains warm. These controls reduce accidental duplication but are not a substitute for a persistent distributed rate limiter. Netlify Functions are ephemeral, so a high-volume public deployment should add an external rate-limiting or cache service and should review Midasbuy's applicable terms and limits.

Do not move the token or signing implementation into the React bundle. Doing so would expose the integration logic, make it easy to tamper with, and reintroduce browser CORS and third-party client-fingerprinting issues. Do not add IP rotation or fake fingerprints to evade third-party restrictions. If Midasbuy rejects Netlify-originated traffic, reduce request volume and verify that the integration is permitted rather than attempting to bypass the restriction.

## Troubleshooting

If the browser reports a 404 for `/api/query`, confirm that the Netlify deployment root is the directory containing `netlify.toml` and that `netlify/functions/query.mjs` was included in the repository. If the function returns a temporary-unavailable error, check the Netlify function logs and verify that the build includes `jsdom` and `netlify/functions/xmidas_real.js`. If the UI still references `localhost:8000`, redeploy the latest frontend build; the current implementation uses the relative `/api/query` route. If plain `pnpm run dev` shows a Vite page but not the serverless response, that is expected; use `npx netlify-cli dev` for local function emulation.

A successful local TypeScript check and production build can be run with:

```bash
pnpm run check
pnpm run build
```

## References

[1]: https://docs.netlify.com/build/functions/overview/ "Netlify Functions overview"

[2]: https://docs.netlify.com/build/functions/get-started/ "Get started with Netlify Functions"

[3]: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/ "Vite on Netlify"

[4]: https://docs.netlify.com/build/functions/configuration/ "Netlify Functions configuration"

[5]: https://www.npmjs.com/package/@netlify/vite-plugin "@netlify/vite-plugin package documentation"
