// Production server: serves the built site from /dist and the chat API.
//   npm run build && npm start      then open http://localhost:3000
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { apiRoute, loadEnvFile } from './server/chat.js'

loadEnvFile()
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const PORT = process.env.PORT || 3000
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' }

if (!fs.existsSync(DIST)) { console.error('No dist/ folder. Run "npm run build" first.'); process.exit(1) }

http.createServer((req, res) => {
  if (apiRoute(req, res)) return
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method not allowed') }
  let rel
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname) } catch { res.writeHead(400); return res.end('Bad request') }
  let file = path.normalize(path.join(DIST, rel.endsWith('/') ? rel + 'index.html' : rel))
  if (!file.startsWith(DIST + path.sep) && file !== DIST) { res.writeHead(404); return res.end('Not found') }
  fs.readFile(file, (err, data) => {
    if (err) { // single page app: unknown paths get index.html
      file = path.join(DIST, 'index.html')
      return fs.readFile(file, (e2, d2) => { if (e2) { res.writeHead(404); return res.end('Not found') } res.writeHead(200, { 'Content-Type': TYPES['.html'] }); res.end(d2) })
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' })
    res.end(data)
  })
}).listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`)
  console.log(process.env.OPENAI_API_KEY ? 'OpenAI chatbot: ON' : 'OpenAI chatbot: OFF (built-in answers). Add OPENAI_API_KEY to .env to turn it on.')
})
