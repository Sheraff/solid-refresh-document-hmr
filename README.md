# solid-refresh: HMR of a module that renders `<html>`

Issue: https://github.com/solidjs/solid-refresh/issues/91

Minimal repro: Vite dev server with SSR (`renderToString`) and `hydrate(() => <Document />, document)`.
`src/Document.jsx` contains `Document` (renders `<html>`) and `App`. `repro.mjs` edits only App's text
(V1 → V2 → V3) and prints the DOM and page errors after each edit.

```sh
npm install
npx playwright install chromium   # or set CHROME_PATH
npm run repro                     # solid-refresh 0.6.3 (what vite-plugin-solid 2.11.14 installs)
node repro.mjs --refresh-reload   # same, with `// @refresh reload` at the top of src/Document.jsx
```

```
initial   V1
edit V2   V2 pageerror: template is not a function
edit V3   V2
```

With `--refresh-reload`: `V1`, `V2`, `V3`, no error.
