import { useEffect } from 'react'

export default function MotionBootstrap() {
  useEffect(() => {
    void import('./motion.js').catch(() => {})
    if (document.querySelector('.earth-surface')) void import('./earth.js').catch(() => {})
  }, [])
  return null
}
