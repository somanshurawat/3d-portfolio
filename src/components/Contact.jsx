import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../data/profile.js'
import Btn from './Btn.jsx'
import { useToast } from './Toast.jsx'

// Fill these in .env (see README). If they are empty, the form opens the visitor's email app instead.
const EJ = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
}

export default function Contact() {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const last = useRef(0)

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); toast('Email copied') } catch { toast('Email: ' + profile.email) }
  }

  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (f.get('website')) return // honeypot: bots fill this hidden field
    const name = f.get('name'), email = f.get('email'), msg = f.get('msg')
    const mailto = () => { location.href = `mailto:${profile.email}?subject=${encodeURIComponent('Portfolio message from ' + name)}&body=${encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')')}` }
    if (!(EJ.service && EJ.template && EJ.key)) { mailto(); toast('Opening your email app…'); form.reset(); return }
    if (Date.now() - last.current < 30000) { toast('Please wait a moment before sending again'); return }
    setBusy(true)
    try {
      const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: EJ.service, template_id: EJ.template, user_id: EJ.key, template_params: { from_name: name, from_email: email, reply_to: email, message: msg } }),
      })
      if (!r.ok) throw new Error(await r.text())
      last.current = Date.now(); form.reset(); toast('Message sent. Thank you!')
    } catch {
      toast("Couldn't send. Opening your email app instead…"); setTimeout(mailto, 900)
    }
    setBusy(false)
  }

  return (
    <>
      <span className="tag">CONTACT</span>
      <h2>Let's Work Together</h2>
      <p className="m">I'm always open to discussing new opportunities, interesting projects or just talking about technology.</p>
      <div className="info">
        <span>✉ {profile.email} <motion.button type="button" className="cp" onClick={copy} aria-label="Copy email address" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>Copy</motion.button></span>
        <span>☎ {profile.phone}</span>
        <span>📍 {profile.location}</span>
      </div>
      <form className="cf" onSubmit={submit}>
        <input name="name" placeholder="Your name" required maxLength={80} aria-label="Your name" />
        <input name="email" type="email" placeholder="Your email" required maxLength={120} aria-label="Your email" />
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <textarea name="msg" rows={4} placeholder="How can I help?" required maxLength={1000} aria-label="Message" />
        <Btn variant="p" type="submit" disabled={busy}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={busy ? 'sending' : 'idle'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>{busy ? 'Sending…' : 'Send message →'}</motion.span>
          </AnimatePresence>
        </Btn>
      </form>
    </>
  )
}
