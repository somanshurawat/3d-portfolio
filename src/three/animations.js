// animations.js: GLB clips (if a model is loaded) or a procedural pose rig, both driven by scroll "pose" values
import * as THREE from 'three'

export function createAnimator({ root, parts, getClips }) {
  // The scroll timeline tweens these 0..1 values
  const pose = { sit: 0, type: 0, wave: 0 }
  let mixer, current = ''
  const actions = {}

  const init = () => {
    const clips = getClips()
    if (!clips.length) return
    mixer = new THREE.AnimationMixer(root)
    clips.forEach((c) => (actions[c.name.toLowerCase()] = mixer.clipAction(c)))
    actions.idle?.reset().fadeIn(0.4).play(); current = 'idle'
  }
  const blend = (from, to, d = 0.6) => {          // cross-fade, never a hard cut
    const f = actions[from], t = actions[to]; if (!t) return
    t.reset().play(); f ? f.crossFadeTo(t, d, false) : t.fadeIn(d); current = to
  }

  let prevX = 0, walk = 0, phase = 0
  const tick = (dt, t, mx, my) => {
    const v = Math.abs(root.position.x - prevX) / Math.max(dt, 0.001); prevX = root.position.x
    walk += (Math.min(v * 0.8, 1) - walk) * 0.15; phase += dt * 8 * walk

    if (mixer) {                                   // GLB mode: pick a clip from scroll state
      const want = pose.type > 0.5 ? 'typing' : pose.sit > 0.5 ? 'sit' : walk > 0.3 ? 'walk' : pose.wave > 0.5 ? 'wave' : 'idle'
      if (want !== current && actions[want]) blend(current, want)
      mixer.update(dt); return
    }
    const p = parts; if (!p.inner) return          // GLB without clips: nothing to animate
    const s = pose.sit, ty = pose.type, w = pose.wave, k = 1 - s
    root.children[0].position.y = -0.4 * s         // lower hips onto the chair
    p.inner.rotation.y = mx * 0.12                 // subtle cursor follow
    p.legL.rotation.x = -1.57 * s + Math.sin(phase) * 0.5 * walk * k
    p.legR.rotation.x = -1.57 * s - Math.sin(phase) * 0.5 * walk * k
    p.shinL.rotation.x = 1.57 * s; p.shinR.rotation.x = 1.57 * s
    const idle = Math.sin(t * 1.6) * 0.03
    p.armL.rotation.x = -1.0 * ty - Math.sin(phase) * 0.5 * walk + idle
    p.armR.rotation.x = -1.0 * ty + Math.sin(phase) * 0.5 * walk - idle
    p.armL.rotation.z = -0.08; p.armR.rotation.z = 0.08 + w * 2.7
    p.foreL.rotation.x = -0.5 * ty + ty * Math.sin(t * 14) * 0.1               // typing jitter
    p.foreR.rotation.x = -0.5 * ty + ty * Math.sin(t * 13 + 1) * 0.1
    p.foreR.rotation.z = w * Math.sin(t * 8) * 0.4                              // wave
    p.eyes.forEach((e) => (e.scale.y = t % 4 < 0.12 ? 0.1 : 1))                 // blink
    p.body.scale.y = 1 + Math.sin(t * 1.6) * 0.01
    p.head.rotation.y = mx * 0.5; p.head.rotation.x = -my * 0.25 + ty * 0.15
  }
  return { pose, init, tick }
}
