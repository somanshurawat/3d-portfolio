import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Button with spring hover/press and a magnetic pull toward the cursor
export default function Btn({ variant, href, className = '', children, ...rest }) {
  const ref = useRef(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 }), sy = useSpring(y, { stiffness: 300, damping: 20 })
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.2)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }
  const leave = () => { x.set(0); y.set(0) }
  const Tag = href ? motion.a : motion.button
  return (
    <Tag ref={ref} href={href} className={`btn${variant === 'p' ? ' p' : ''} ${className}`} style={{ x: sx, y: sy }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onMouseMove={move} onMouseLeave={leave} {...rest}>
      {children}
    </Tag>
  )
}
