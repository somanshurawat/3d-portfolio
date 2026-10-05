import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { experience, profile, projects, repos, skills } from '../data/profile.js'

// Built-in answers (always work). If the server has an OpenAI key, replies come from OpenAI instead.
const ANS = [
  [/\b(hi|hello|hey)\b/, () => "Hi! I can tell you about Somanshu's skills, experience, projects, GitHub or how to reach him."],
  [/skill|tech|stack|language|tools?\b|know/, () => `${profile.first} works with ${skills.map((s) => s.name).join(', ')}.`],
  [/experien|work|job|career|role|company|consult/, () => `${experience.map((e) => `${e.role} (${e.period})`).join('; ')}.`],
  [/project|built|build|solution|dashboard/, () => 'His featured projects solve three problems:\n' + projects.map((p) => '• ' + p.title).join('\n')],
  [/github|repo|code|open.?source/, () => `His GitHub (github.com/somanshurawat) has repos like ${repos.slice(0, 3).map((r) => r.name).join(', ')}. You can browse them all on his GitHub profile.`],
  [/contact|email|mail|phone|call|reach|hire|linkedin|instagram/, () => `You can reach ${profile.first} at ${profile.email} or ${profile.phone}. He's also on LinkedIn and Instagram (links are in the Contact scene at the end of the page).`],
  [/where|location|based|live|india|delhi/, () => `${profile.first} is based in ${profile.location}.`],
  [/resume|cv/, () => `For a resume, please email ${profile.email} and he'll send it over.`],
  [/open|available|opportunit/, () => `Yes, ${profile.first} is open to new opportunities. Email him at ${profile.email}.`],
]
const local = (t) => {
  t = t.toLowerCase()
  for (const [re, fn] of ANS) if (re.test(t)) return fn()
  return `I can answer questions about ${profile.first}'s skills, experience, projects, GitHub or contact details. For anything else, email ${profile.email}.`
}
const SUGGESTIONS = ['What are his skills?', 'Tell me about his experience', 'What projects has he built?', 'How can I contact him?']

function Typing() {
  return (
    <div className="msg b dots" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => <motion.span key={i} animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />)}
    </div>
  )
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ r: 'b', t: `Hi! I'm ${profile.first}'s assistant. What would you like to know?` }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [ai, setAi] = useState(false)
  const [showSugg, setShowSugg] = useState(true)
  const box = useRef(null)

  useEffect(() => { fetch('/api/chat/status').then((r) => (r.ok ? r.json() : null)).then((j) => j && setAi(!!j.enabled)).catch(() => {}) }, [])
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy])
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [])

  const send = async (text) => {
    const t = (text ?? input).trim()
    if (!t || busy) return
    setInput(''); setShowSugg(false)
    const next = [...msgs, { r: 'u', t }]
    setMsgs(next); setBusy(true)
    let ans = ''
    if (ai) {
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-8).map((m) => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t })) }) })
        if (r.ok) ans = ((await r.json()).reply || '').trim()
      } catch {}
    }
    if (!ans) { await new Promise((r) => setTimeout(r, 550)); ans = local(t) }
    setMsgs((m) => [...m, { r: 'b', t: ans }]); setBusy(false)
  }

  return (
    <>
      <motion.button className="cbtn" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close chat' : 'Open chat assistant'} aria-expanded={open}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 2 }} whileHover={{ scale: 1.1, rotate: -6 }} whileTap={{ scale: 0.9 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'c'} style={{ display: 'block' }} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>{open ? '✕' : '💬'}</motion.span>
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div className="chat" role="dialog" aria-label="Portfolio assistant" initial={{ opacity: 0, scale: 0.85, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 16 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <div className="ch"><div><b>Ask about {profile.first}</b><small>{ai ? 'Powered by OpenAI' : 'Quick answers'}</small></div><motion.button className="cx" onClick={() => setOpen(false)} aria-label="Close chat" whileHover={{ rotate: 90 }}>✕</motion.button></div>
            <div className="msgs" ref={box} aria-live="polite">
              {msgs.map((m, i) => <motion.div key={i} className={'msg ' + m.r} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}>{m.t}</motion.div>)}
              {busy && <Typing />}
            </div>
            <AnimatePresence>
              {showSugg && <motion.div className="sugg" exit={{ opacity: 0, height: 0 }}>{SUGGESTIONS.map((q) => <motion.button key={q} onClick={() => send(q)} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>{q}</motion.button>)}</motion.div>}
            </AnimatePresence>
            <div className="cin">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about skills, projects, experience…" maxLength={300} aria-label="Your question" autoFocus />
              <button onClick={() => send()} disabled={busy} aria-label="Send">➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
