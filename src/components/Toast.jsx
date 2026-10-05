import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Ctx = createContext(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const timer = useRef()
  const show = useCallback((m) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(''), 2600)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div key={msg} className="toast" role="status" initial={{ opacity: 0, y: 30, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}
