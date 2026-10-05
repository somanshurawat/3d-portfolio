// scroll.js: one master GSAP timeline scrubbed by scroll (length = TOTAL units, see nav.js)
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TOTAL } from './nav.js'
import { projects } from '../data/profile.js'
gsap.registerPlugin(ScrollTrigger)

export function initScroll(S, A) {
  const { camera, look, lights, root, desk, floaters, drawScreen, SIT_X, isMobile } = S
  const { pose } = A
  const X = (v) => (isMobile ? v * 0.2 : v)    // keep the character on-screen on phones
  const D = isMobile ? -0.6 : 0                // shift the scene up so text sits underneath

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1 }, // scrub:1 = 1s smoothing, no jitter
  })
  tl.set({}, {}, TOTAL)                        // pad the timeline to full length

  // Camera: position + look-at target tweened together
  const cam = (at, d, p, l) => tl
    .to(camera.position, { x: X(p[0]), y: p[1] + D, z: p[2] + (isMobile ? 1.2 : 0), duration: d }, at)
    .to(look, { x: X(l[0]), y: l[1] + D, z: 0, duration: d }, at)
  // Lights: [purple, pink, rim, key]
  const L = (at, d, v) => tl.to(lights.purple, { intensity: v[0], duration: d }, at).to(lights.pink, { intensity: v[1], duration: d }, at)
    .to(lights.rim, { intensity: v[2], duration: d }, at).to(lights.key, { intensity: v[3], duration: d }, at)
  // Character: x position, y rotation
  const C = (at, d, x, ry, ease) => tl.to(root.position, { x: X(x), duration: d, ease }, at).to(root.rotation, { y: ry, duration: d, ease }, at)
  // Text panels fade/slide in and out
  const show = (id, a, b) => tl.fromTo(id, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 3, ease: 'power2.out' }, a)
    .to(id, { autoAlpha: 0, y: -50, duration: 3 }, b - 3)

  gsap.set(camera.position, { y: 1.75 + D, z: 2.6 + (isMobile ? 1.2 : 0) }); gsap.set(look, { y: 1.7 + D })

  // HERO -> ABOUT
  tl.to('#hero', { autoAlpha: 0, y: -60, duration: 3 }, 8)
  cam(8, 14, [-0.4, 1.6, 3.6], [0.7, 1.5, 0]); C(8, 14, 1.5, -0.5); L(8, 14, [40, 8, 18, 0.9])
  tl.to(floaters.scale, { x: 1, y: 1, z: 1, duration: 8 }, 10)
  show('#about', 12, 28)
  // ABOUT -> walk to the desk, desk appears, character turns and sits
  cam(28, 12, [0, 1.4, 5.5], [-0.6, 1, 0]); C(28, 12, SIT_X, -Math.PI / 2, 'power1.inOut')
  tl.to(desk.scale, { x: 1, y: 1, z: 1, duration: 6, ease: 'back.out(1.4)' }, 34)
  tl.to(root.rotation, { y: Math.PI / 2, duration: 4 }, 38)
  tl.to(pose, { sit: 1, duration: 6 }, 40).to(pose, { type: 1, duration: 4 }, 46)
  // WHAT I DO: profile view
  cam(40, 10, [0.3, 1.3, 4.8], [0.3, 1.1, 0]); L(40, 10, [35, 25, 25, 0.7])
  show('#what', 44, 64)
  tl.from('.caps article', { autoAlpha: 0, x: 40, stagger: 1, duration: 3 }, 45)
  // PROJECTS: camera pushes to the monitor; the screen changes with each project
  cam(62, 8, [0.3, 1.25, 3.4], [0.3, 1.0, 0]); L(62, 8, [55, 30, 35, 1.1])
  show('#projects', 66, 94)
  let last = -1; const st = { i: 0 }, n = projects.length
  tl.to(st, { i: n - 0.01, duration: 26, ease: 'none', onUpdate() {
    const i = Math.floor(st.i); if (i === last) return; last = i
    document.querySelectorAll('.proj').forEach((e, k) => e.classList.toggle('on', k === i)); drawScreen(i)
  } }, 68)
  // SKILLS: camera pulls back, character stands up
  cam(94, 18, [0, 1.6, 6.5], [0, 1.2, 0]); L(94, 14, [35, 20, 30, 0.8])
  tl.to(pose, { type: 0, duration: 3 }, 94).to(pose, { sit: 0, duration: 6 }, 98)
  tl.to(root.rotation, { y: 0.4, duration: 6 }, 98)
  show('#skills', 96, 112)
  tl.from('.tile', { autoAlpha: 0, stagger: 0.15, duration: 2 }, 97)   // tiles light up one by one
  // EXPERIENCE: desk leaves, standing pose
  tl.to(desk.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 6 }, 106)
  cam(110, 12, [0, 1.5, 5], [0, 1.3, 0]); L(110, 12, [30, 12, 22, 0.8])
  show('#exp', 114, 130)
  tl.from('.job', { autoAlpha: 0, x: 30, stagger: 1.5, duration: 3 }, 115)
  // CONTACT: walk to centre, face the viewer, wave
  C(122, 12, 0, 0, 'power1.inOut')
  cam(126, 14, [0, 1.6, 3.8], [0, 1.4, 0]); L(126, 14, [30, 14, 25, 0.9])
  tl.fromTo('#contact', { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 }, 132)
  tl.to(pose, { wave: 1, duration: 3 }, 135)

  return { tl, kill: () => { tl.scrollTrigger?.kill(); tl.kill() } }
}
