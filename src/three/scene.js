// scene.js: Three.js scene, camera, lights, character, desk and floating shapes.
// createScene(canvas) returns everything the scroll timeline and render loop need.
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { projects } from '../data/profile.js'

// Monitor content: one screen per project in profile.js
const HUES = [270, 330, 200, 290, 310]
const LABEL = { bars: 'Maintenance', map: 'Incidents', tiles: 'Operations' }
const SCREENS = projects.map((p, i) => [LABEL[p.visual] || 'Project', HUES[i % HUES.length]])

const mat = (c, r = 0.45, e = 0, ei = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.05, emissive: e, emissiveIntensity: ei })
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o }

// Red buffalo-check texture for the flannel shirt
function plaidTexture() {
  const k = document.createElement('canvas'); k.width = k.height = 64
  const x = k.getContext('2d')
  x.fillStyle = '#a3202a'; x.fillRect(0, 0, 64, 64)
  x.fillStyle = 'rgba(18,8,12,.55)'; x.fillRect(0, 0, 32, 64); x.fillRect(0, 0, 64, 32)
  const t = new THREE.CanvasTexture(k); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function createScene(canvas) {
  const isMobile = matchMedia('(max-width:768px)').matches
  const SIT_X = isMobile ? -0.5 : -1.3                 // where the character sits at the desk

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x070509, 8, 18)
  const rig = new THREE.Group(); scene.add(rig)         // parent of camera: mouse parallax moves this
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 50)
  camera.position.set(0, 1.75, 2.6); rig.add(camera)    // hero = close bust shot
  const look = new THREE.Vector3(0, 1.7, 0)             // GSAP animates this; camera.lookAt(look) each frame

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9

  // Lights (intensities are animated by the scroll timeline)
  const lights = {
    amb: new THREE.AmbientLight(0x6a5a8a, 0.35),
    key: new THREE.DirectionalLight(0xffffff, 0.9),
    purple: new THREE.PointLight(0xa855f7, 30, 12),
    pink: new THREE.PointLight(0xf0a6ca, 10, 12),
    rim: new THREE.PointLight(0xc084fc, 20, 12),
  }
  lights.key.position.set(3, 5, 4); lights.purple.position.set(-3, 2.5, 2.5)
  lights.pink.position.set(3, 1.5, 2); lights.rim.position.set(0, 3, -3)
  Object.values(lights).forEach((l) => scene.add(l))

  // Character built from primitives, dressed like the avatar. Replaced by models/character.glb if present.
  const root = new THREE.Group()   // GSAP moves/rotates this
  const parts = {}                 // joints used by the procedural animation
  const skin = mat(0xe3b08c), pants = mat(0x15131a, 0.6), hair = mat(0x120e0d, 0.5), dark = mat(0x0b0910, 0.3), shoe = mat(0xf2eff6), hood = mat(0x17141c, 0.6)
  const shirt = new THREE.MeshStandardMaterial({ map: plaidTexture(), roughness: 0.7, metalness: 0.02 })
  ;(function buildCharacter() {
    const inner = new THREE.Group(); root.add(inner); parts.inner = inner
    parts.body = mesh(new THREE.CapsuleGeometry(0.3, 0.4, 6, 16), shirt, 0, 1.3, 0)
    const head = new THREE.Group(); head.position.y = 1.95; parts.head = head
    const skull = mesh(new THREE.SphereGeometry(0.27, 32, 24), skin); skull.scale.set(1, 1.1, 1)
    const cap = mesh(new THREE.SphereGeometry(0.285, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.04, -0.01); cap.rotation.x = -0.25
    head.add(skull, cap)
    ;[-1, 1].forEach((s) => {
      const eye = mesh(new THREE.SphereGeometry(0.04, 12, 12), dark, s * 0.09, 0.03, 0.245); (parts.eyes ||= []).push(eye); head.add(eye)
      head.add(mesh(new THREE.BoxGeometry(0.11, 0.02, 0.02), dark, s * 0.09, 0.11, 0.25))
      head.add(mesh(new THREE.SphereGeometry(0.05, 12, 12), skin, s * 0.27, 0, 0))
    })
    head.add(mesh(new THREE.SphereGeometry(0.05, 16, 16), skin, 0, -0.04, 0.265), mesh(new THREE.BoxGeometry(0.1, 0.015, 0.02), dark, 0, -0.14, 0.245))
    inner.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 16), skin, 0, 1.75, 0))
    const collar = mesh(new THREE.TorusGeometry(0.14, 0.04, 10, 24), hood, 0, 1.78, 0); collar.rotation.x = Math.PI / 2; inner.add(collar)
    const limb = (side, y, x, r, len, leg) => {
      const top = new THREE.Group(); top.position.set(side * x, y, 0)
      top.add(mesh(new THREE.CapsuleGeometry(r, len, 4, 10), leg ? pants : shirt, 0, -(len / 2 + r) + 0.02, 0))
      const low = new THREE.Group(); low.position.y = -(len + r * 2) + 0.04
      low.add(mesh(new THREE.CapsuleGeometry(r * 0.9, len, 4, 10), leg ? pants : shirt, 0, -(len / 2 + r), 0))
      low.add(leg ? mesh(new THREE.BoxGeometry(0.16, 0.08, 0.3), shoe, 0, -(len + r * 2) + 0.02, 0.05)
                  : mesh(new THREE.SphereGeometry(r * 0.95, 12, 12), skin, 0, -(len + r * 2) + 0.02, 0))
      top.add(low); return [top, low]
    }
    ;[[-1, 'L'], [1, 'R']].forEach(([s, n]) => {
      const [a, f] = limb(s, 1.6, 0.38, 0.07, 0.3, false); parts['arm' + n] = a; parts['fore' + n] = f; inner.add(a)
      const [l, sh] = limb(s, 0.9, 0.15, 0.09, 0.32, true); parts['leg' + n] = l; parts['shin' + n] = sh; inner.add(l)
    })
    inner.add(parts.body, head)
    scene.add(root)
  })()

  // Glow pool under the character
  const gc = document.createElement('canvas'); gc.width = gc.height = 128
  const gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gg.addColorStop(0, 'rgba(192,132,252,.55)'); gg.addColorStop(1, 'rgba(192,132,252,0)')
  gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128)
  const glow = mesh(new THREE.CircleGeometry(1.8, 48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.01; scene.add(glow)

  // Desk, chair, monitor, keyboard. Local +x is "forward" from the seated character.
  const desk = new THREE.Group()
  desk.position.set(SIT_X, 0, 0); desk.scale.setScalar(0.001); scene.add(desk)
  const white = mat(0xe8e4ee, 0.5), pinkM = mat(0xf0a6ca, 0.4)
  desk.add(mesh(new THREE.BoxGeometry(0.8, 0.05, 1.4), white, 0.85, 0.75, 0))
  ;[[0.5, 0.6], [1.2, 0.6], [0.5, -0.6], [1.2, -0.6]].forEach(([x, z]) => desk.add(mesh(new THREE.BoxGeometry(0.04, 0.75, 0.04), white, x, 0.375, z)))
  desk.add(mesh(new THREE.BoxGeometry(0.28, 0.02, 0.1), mat(0x2a2233), 0.62, 0.79, 0))   // keyboard
  desk.add(mesh(new THREE.BoxGeometry(0.04, 0.25, 0.04), white, 1.1, 0.9, 0))            // monitor stand
  desk.add(mesh(new THREE.BoxGeometry(0.03, 0.62, 1.0), mat(0x14101a), 1.12, 1.2, 0))    // monitor body
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 320
  const scTex = new THREE.CanvasTexture(sc); scTex.colorSpace = THREE.SRGBColorSpace
  const screen = mesh(new THREE.PlaneGeometry(0.94, 0.56), new THREE.MeshBasicMaterial({ map: scTex }), 1.095, 1.2, 0)
  screen.rotation.y = -Math.PI / 2; desk.add(screen)
  desk.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), pinkM, -0.1, 0.45, 0))              // chair seat
  desk.add(mesh(new THREE.BoxGeometry(0.05, 0.5, 0.5), pinkM, -0.35, 0.72, 0))             // chair back
  desk.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45), white, -0.1, 0.22, 0))

  const drawScreen = (i) => {                     // monitor content changes with the project
    const [t, h] = SCREENS[i % SCREENS.length], c = sc.getContext('2d')
    c.fillStyle = `hsl(${h},60%,10%)`; c.fillRect(0, 0, 512, 320)
    c.fillStyle = `hsl(${h},80%,65%)`; c.font = '800 38px sans-serif'; c.fillText(t, 28, 64)
    for (let k = 0; k < 7; k++) { c.fillStyle = `hsla(${h},70%,70%,${0.15 + (k % 3) * 0.12})`; c.fillRect(28, 100 + k * 28, 120 + ((k * 97 + i * 53) % 300), 12) }
    c.fillStyle = `hsl(${h},80%,60%)`; for (let k = 0; k < 6; k++) c.fillRect(330 + k * 25, 290 - ((k * 41 + i * 37) % 120), 16, ((k * 41 + i * 37) % 120))
    scTex.needsUpdate = true
  }
  drawScreen(0)

  // Floating abstract shapes
  const floaters = new THREE.Group(); floaters.scale.setScalar(0.001); scene.add(floaters)
  for (let i = 0; i < (isMobile ? 4 : 8); i++) {
    floaters.add(mesh(i % 2 ? new THREE.IcosahedronGeometry(0.1, 0) : new THREE.SphereGeometry(0.06, 16, 16), mat(0xa855f7, 0.3, 0xa855f7, 0.8),
      Math.sin(i * 2.1) * 3, 0.8 + (i % 4) * 0.5, Math.cos(i * 1.7) * 1.5 - 1))
  }

  // Optional: public/models/character.glb replaces the primitive character (Draco-ready)
  let clips = []
  const loadAssets = (onProgress) => new Promise((res) => {
    const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    const loader = new GLTFLoader().setDRACOLoader(draco)
    loader.load(import.meta.env.BASE_URL + 'models/character.glb', (g) => {
      root.clear(); parts.inner = null
      root.add(g.scene); clips = g.animations; res(true)
    }, (e) => e.total && onProgress(e.loaded / e.total), () => res(false))   // no file: keep the primitive character
  })

  const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight) }
  const dispose = () => {
    scene.traverse((o) => { o.geometry?.dispose(); const m = o.material; if (m) { m.map?.dispose(); m.dispose() } })
    renderer.dispose()
  }

  return { isMobile, SIT_X, scene, camera, look, rig, renderer, lights, root, parts, glow, desk, floaters, drawScreen, loadAssets, getClips: () => clips, resize, dispose }
}
