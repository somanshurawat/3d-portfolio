import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { capabilities, experience, profile, projects, skills, techStrip } from '../data/profile.js'
import { ICONS } from '../data/icons.js'
import { goTo } from '../three/nav.js'
import Contact from './Contact.jsx'

// [label, timeline unit]: where each link jumps to along the scroll story (see three/scroll.js)
const NAV = [['About', 12], ['What I do', 44], ['Work', 66], ['Skills', 96], ['Experience', 114], ['Contact', 130]]
const SHORT = ['About', 'Work', 'Experience', 'Contact']
const jump = (e, unit, after) => { e.preventDefault(); after?.(); goTo(unit) }

const months = (new Date().getFullYear() - profile.careerStart.year) * 12 + new Date().getMonth() - profile.careerStart.month
const years = Math.max(1, Math.floor(months / 12))
const pad = (i) => String(i + 1).padStart(2, '0')
const SOCIAL = [['GH', 'GitHub', profile.links.github], ['in', 'LinkedIn', profile.links.linkedin], ['IG', 'Instagram', profile.links.instagram], ['@', 'Email', 'mailto:' + profile.email]]

function Header() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header>
        <a className="logo" href="#top" onClick={(e) => jump(e, 0)}>{profile.initials.join('')}</a>
        <a className="mail" href={'mailto:' + profile.email}>{profile.email}</a>
        <nav className="links">{NAV.filter(([l]) => SHORT.includes(l)).map(([l, u]) => <a key={l} href="#" onClick={(e) => jump(e, u)}>{l}</a>)}</nav>
        <button id="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? '✕' : '☰'}</button>
      </header>
      <nav id="menu" className={open ? 'open' : ''}>{NAV.map(([l, u]) => <a key={l} href="#" onClick={(e) => jump(e, u, () => setOpen(false))}>{l}</a>)}</nav>
    </>
  )
}

// Rotates through the roles in profile.js
function Roles() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((k) => (k + 1) % profile.roles.length), 3200); return () => clearInterval(t) }, [])
  return <small key={i} className="role">{profile.roles[i]}</small>
}

function ContactPanel() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const key = (e) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', key); return () => removeEventListener('keydown', key)
  }, [])
  return (
    <>
      <section className="panel" id="contact">
        <h2 className="cta">Let's build<br />something<br />great.</h2>
        <p className="cmeta">{profile.email}<br />{profile.phone}<br />{profile.location}</p>
        <div className="cl">
          <button className="say" onClick={() => setOpen(true)}>Say hello →</button>
          <a href={'mailto:' + profile.email}>Email</a>
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={profile.links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </section>
      <AnimatePresence>
        {open && (
          <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div className="mbox" role="dialog" aria-label="Contact" onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.96 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
              <button className="mx" onClick={() => setOpen(false)} aria-label="Close">✕</button>
              <Contact />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Overlay() {
  return (
    <>
      <Header />
      <aside className="social">
        {SOCIAL.map(([t, label, href]) => <a key={label} href={href} aria-label={label} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{t}</a>)}
      </aside>
      <a className="resume" href={profile.resumeUrl || ('mailto:' + profile.email + '?subject=Resume request')} {...(profile.resumeUrl ? { download: true } : {})}>Resume ↗</a>

      <main>
        <section className="panel" id="hero">
          <div className="hl"><p>Hello! I'm</p><h1>{profile.name.toUpperCase()}</h1><span className="avail"><i />Open to opportunities</span></div>
          <div className="hr"><p>A</p><h2>FULL STACK DEVELOPER</h2><Roles /></div>
          <div className="hint">Scroll</div>
        </section>

        <section className="panel side-l" id="about">
          <h2 className="big">About me</h2>
          <p className="lead">Software engineer building scalable web applications with modern technologies.</p>
          <p>I'm a software engineer with experience in building web applications using modern technologies like Node.js, PostgreSQL, SQL Server, and responsive frontend frameworks. I enjoy problem-solving, optimizing performance, and writing clean, maintainable code.</p>
          <ul className="facts"><li><b>{years}+</b> years</li><li><b>{projects.length}</b> featured projects</li><li><b>{profile.location.split(',')[0]}</b>, India</li></ul>
        </section>

        <section className="panel side-r" id="what">
          <h2 className="huge">What I do</h2>
          <div className="caps">
            {capabilities.map((c) => <article key={c.title}><h3>{c.title}</h3><p>{c.desc}</p><span aria-hidden="true">↓</span></article>)}
          </div>
        </section>

        <section className="panel side-r" id="projects">
          {projects.map((p, i) => (
            <div key={p.title} className={'proj' + (i === 0 ? ' on' : '')}>
              <b>{pad(i)}</b><h3>{p.title}</h3><p>{p.desc}</p>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <small>{p.tags.join(' · ')}</small>
            </div>
          ))}
          <a className="more" href={profile.links.github} target="_blank" rel="noopener noreferrer">More on GitHub ↗</a>
        </section>

        <section className="panel tech" id="skills">
          <h2 className="big">Tech stack</h2>
          <div className="tiles">
            {skills.map((s) => <div className="tile" key={s.name}><svg viewBox="0 0 24 24" fill={s.color} aria-hidden="true"><path d={ICONS[s.icon]} /></svg>{s.name}</div>)}
          </div>
          <p className="also">Also: {techStrip.filter((t) => !skills.some((s) => s.name === t)).join(' · ')}</p>
        </section>

        <section className="panel side-r" id="exp">
          <h2 className="big">Experience</h2>
          <div className="tline">
            {experience.map((e) => (
              <div className="job" key={e.role + e.period}>
                <h4>{e.period.match(/\d{4}/)[0]}</h4>
                <div><h3>{e.role}</h3><small>{e.period}</small></div>
                <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <ContactPanel />
      </main>
      <div id="story" />
    </>
  )
}
