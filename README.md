# Somanshu Rawat - 3D Scroll Portfolio (React + Three.js + GSAP + Framer Motion)

A scroll-driven 3D story: a character (dressed like your avatar) walks, sits at a desk, types while the monitor shows each project, stands back up and waves in the contact scene. All content comes from `src/data/profile.js`.

## Run it
Requires Node.js 18 or newer.
```
npm install
npm run dev          # http://localhost:5173 (hot reload, chat API included)
npm run build        # creates dist/
npm start            # serves dist/ and the chat API at http://localhost:3000
```

## Project structure
```
src/
├── main.jsx / App.jsx          entry; mounts Stage + Overlay + Chatbot
├── styles.css                  all styles (3D design + chat/contact/modal)
├── data/profile.js             YOUR CONTENT: name, links, roles, experience, skills, projects, capabilities
├── data/icons.js               skill logos (SVG paths)
├── three/
│   ├── scene.js                renderer, lights, character, desk, monitor, floating shapes
│   ├── animations.js           procedural pose rig (or GLB clips) driven by scroll
│   ├── scroll.js               ONE GSAP timeline scrubbed by scroll: camera, lights, character, panels
│   └── nav.js                  timeline length + jump-to helper for the menu
└── components/
    ├── Stage.jsx               canvas, loader, cursor, render loop
    ├── Overlay.jsx             header/menu, every text panel, contact modal
    ├── Contact.jsx             contact form (EmailJS) shown in the modal
    ├── Chatbot.jsx             chat widget (built-in answers, optional OpenAI)
    └── Toast.jsx, Btn.jsx      small helpers
```

## Edit your content
- Everything text-based: `src/data/profile.js` (the page, chatbot and server all read it).
- Resume: put the PDF in `public/` and set `resumeUrl: '/resume.pdf'`. Until then the Resume link emails you.
- Timing of each scene: the numbers in `src/three/scroll.js` (the story is 140 units long, `TOTAL` in `nav.js`). Menu links jump to those units (`NAV` in `Overlay.jsx`).
- Scroll length: `#story{height:1200vh}` in `styles.css`.

## Use your own 3D character (optional)
Drop a rigged `character.glb` into `public/models/`. It replaces the built-in character. Name its animation clips `idle`, `walk`, `sit`, `typing`, `wave` and the scroll timeline will blend between them.

## Contact form (EmailJS) and OpenAI chatbot
Copy `.env.example` to `.env` and fill it in. Setup steps are the same as before:
1. EmailJS: create a template using `{{from_name}}`, `{{from_email}}`, `{{message}}`, Reply-To `{{reply_to}}`, fill the three `VITE_EMAILJS_*` values and allow your domain. Without them the form opens the visitor's email app.
2. OpenAI: set `OPENAI_API_KEY` (server only, never sent to the browser). Without it the chat uses built-in answers.

## Deploy
- Node host (Render, Railway, VPS): `npm install && npm run build`, start with `npm start`.
- Static host (Netlify, Vercel, GitHub Pages): deploy `dist/`; chat uses built-in answers there.
- If WebGL is unavailable the content shows as a plain scrolling page.
