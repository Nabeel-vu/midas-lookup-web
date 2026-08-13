# Fixed Netlify Function Files

Replace the two files in your Windows project's `netlify\\functions` folder:

- `query.mjs`
- `xmidas_real.js`

The important fix is in `query.mjs`: it no longer aliases JSDOM's `window.performance` onto Node's global `performance`. That alias caused recursive `Performance.now()` calls after repeated lookups.

From the project root, run:

```bat
copy /Y "C:\path\to\downloaded\query.mjs" "netlify\functions\query.mjs"
copy /Y "C:\path\to\downloaded\xmidas_real.js" "netlify\functions\xmidas_real.js"
pnpm run dev
```

Then test the Vite route:

```bat
curl.exe "http://localhost:3000/api/query?id=52464227951"
```

The response should contain `"success":true` and the player name. Keep `xmidas_real.js` in the same directory as `query.mjs`; do not rename either file.
