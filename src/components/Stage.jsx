import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import * as THREE from 'three'
import avatarUrl from '../assets/avatar.png'
import { createScene } from '../three/scene.js'
import { createAnimator } from '../three/animations.js'
import { initScroll } from '../three/scroll.js'

// Owns the WebGL canvas, loader, custom cursor and render loop. The scroll timeline lives in three/scroll.js.
export default function Stage() {
  const canvas = useRef(null), loader = useRef(null), pct = useRef(null), cursor = useRef(null)

  useEffect(() => {
    const prog = { v: 0 }
    const show = () => { if (pct.current) pct.current.textContent = Math.round(prog.v) + '%' }
    const hideLoader = () => gsap.to(loader.current, { autoAlpha: 0, duration: 0.8, delay: 0.2 })
    const ease = gsap.to(prog, { v: 90, duration: 1.4, ease: 'power1.out', onUpdate: show }) // eased progress; real load completes it

    let S
    try { S = createScene(canvas.current) } catch (err) {   // no WebGL: show the content as a plain page
      console.warn('WebGL unavailable', err); ease.kill(); document.documentElement.classList.add('no-gl'); hideLoader(); return
    }
    const A = createAnimator(S)
    let dead = false, scroll

    const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
    const onMove = (e) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1
      if (!S.isMobile && cursor.current) cursor.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`
    }
    const onOver = (e) => cursor.current?.classList.toggle('h', !!e.target.closest?.('a,button,article,.tile,input,textarea'))
    addEventListener('pointermove', onMove); addEventListener('pointerover', onOver); addEventListener('resize', S.resize)

    S.loadAssets((p) => { prog.v = Math.max(prog.v, p * 90); show() }).then(() => {
      if (dead) return
      A.init(); scroll = initScroll(S, A)
      gsap.to(prog, { v: 100, duration: 0.5, onUpdate: show, onComplete: () => {
        hideLoader()
        gsap.from('#hero > *', { autoAlpha: 0, y: 30, stagger: 0.15, duration: 1, delay: 0.5 })
      } })
    })

    const clock = new THREE.Clock()
    S.renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime
      mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05
      S.rig.position.set(mouse.sx * 0.2, -mouse.sy * 0.1, 0)        // subtle camera shift
      S.lights.purple.position.x = -3 + mouse.sx * 1.2               // lighting responds to the cursor
      S.camera.lookAt(S.look)
      S.glow.position.x = S.root.position.x
      S.floaters.rotation.y = t * 0.1; S.floaters.children.forEach((m, i) => (m.position.y += Math.sin(t + i) * 0.0008))
      A.tick(dt, t, mouse.sx, mouse.sy)
      S.renderer.render(S.scene, S.camera)
    })

    return () => {
      dead = true; ease.kill(); gsap.killTweensOf(prog)
      removeEventListener('pointermove', onMove); removeEventListener('pointerover', onOver); removeEventListener('resize', S.resize)
      S.renderer.setAnimationLoop(null); scroll?.kill(); S.dispose()
    }
  }, [])

  return (
    <>
      <canvas id="gl" ref={canvas} aria-hidden="true" />
      <div id="cursor" ref={cursor} aria-hidden="true" />
      <div id="loader" ref={loader}>
        <img src={avatarUrl} alt="" />
        <span>Loading experience</span><b ref={pct}>0%</b>
      </div>
    </>
  )
}
