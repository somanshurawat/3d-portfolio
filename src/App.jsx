import { MotionConfig } from 'framer-motion'
import { ToastProvider } from './components/Toast.jsx'
import Stage from './components/Stage.jsx'
import Overlay from './components/Overlay.jsx'
import Chatbot from './components/Chatbot.jsx'

export default function App() {
  return (
    // reducedMotion="user": visitors who prefer less motion get no movement animations from Framer Motion
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Stage />
        <Overlay />
        <Chatbot />
      </ToastProvider>
    </MotionConfig>
  )
}
