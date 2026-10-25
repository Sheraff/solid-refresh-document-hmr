// node repro.mjs [--refresh-reload]
// Vite dev server with SSR + hydrate(document). Edits only App's text in src/Document.jsx
// (V1 -> V2 -> V3) and prints the DOM and page errors after each edit.
// --refresh-reload adds `// @refresh reload` to src/Document.jsx first.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import solid from 'vite-plugin-solid'
import { chromium } from 'playwright'

const file = new URL('./src/Document.jsx', import.meta.url)
const original = readFileSync(file, 'utf8')
const v1 = process.argv.includes('--refresh-reload') ? '// @refresh reload\n' + original : original
writeFileSync(file, v1)

const server = await createServer({
  root: fileURLToPath(new URL('.', import.meta.url)),
  configFile: false,
  appType: 'custom',
  logLevel: 'silent',
  server: { port: 4175, strictPort: true },
  plugins: [
    solid({ ssr: true }),
    {
      name: 'ssr',
      configureServer(server) {
        return () =>
          server.middlewares.use(async (req, res, next) => {
            if (req.url !== '/') {
              return next()
            }
            const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
            res.setHeader('content-type', 'text/html')
            res.end(render())
          })
      },
    },
  ],
})
await server.listen()
let browser
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('http://localhost:4175/')
  await page.waitForTimeout(1000)
  console.log('initial  ', await page.textContent('#text'))
  for (const v of ['V2', 'V3']) {
    errors.length = 0
    writeFileSync(file, v1.replace('>V1<', `>${v}<`))
    await page.waitForTimeout(2000)
    console.log(`edit ${v}  `, await page.textContent('#text'), errors.length ? `pageerror: ${errors.join(' | ')}` : '')
  }
} finally {
  writeFileSync(file, original)
  await browser?.close()
  await server.close()
}
