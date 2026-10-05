// Chat API shared by the dev server (vite) and the production server (server.js). Node 18+, no extra packages.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { KB } from '../src/data/profile.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function loadEnvFile() {
  try {
    for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
}

const SYSTEM = `You are the assistant on Somanshu Rawat's portfolio website. Answer visitors' questions using ONLY the facts below. Be friendly and concise (under 60 words). If the answer isn't in the facts, say you don't know and suggest emailing him. Don't invent details.\n\nFACTS:\n${KB}`
const hits = new Map()
const limited = (ip) => {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60000)
  list.push(now); hits.set(ip, list)
  return list.length > 20
}
const send = (res, status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)) }

async function handleChat(req, res) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return send(res, 503, { error: 'OpenAI is not configured' })
  if (limited(req.socket.remoteAddress)) return send(res, 429, { error: 'Too many requests' })
  let raw = ''
  for await (const chunk of req) { raw += chunk; if (raw.length > 10000) return send(res, 413, { error: 'Too large' }) }
  let body
  try { body = JSON.parse(raw) } catch { return send(res, 400, { error: 'Bad request' }) }
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-8).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 500),
  }))
  if (!messages.length) return send(res, 400, { error: 'No messages' })
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', max_tokens: 200, temperature: 0.4, messages: [{ role: 'system', content: SYSTEM }, ...messages] }),
    })
    if (!r.ok) { console.error('OpenAI error', r.status, (await r.text()).slice(0, 200)); return send(res, 502, { error: 'Upstream error' }) }
    const j = await r.json()
    send(res, 200, { reply: j.choices?.[0]?.message?.content || '' })
  } catch (e) { console.error(e.message); send(res, 502, { error: 'Upstream error' }) }
}

// Returns true when the request was an API request and has been handled
export function apiRoute(req, res) {
  const url = (req.url || '').split('?')[0]
  if (url === '/api/chat/status' && req.method === 'GET') { send(res, 200, { enabled: !!process.env.OPENAI_API_KEY }); return true }
  if (url === '/api/chat' && req.method === 'POST') { handleChat(req, res); return true }
  return false
}
