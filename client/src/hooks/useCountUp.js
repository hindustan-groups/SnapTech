import { useState, useEffect, useRef } from 'react'

/**
 * useCountUp — animates a number from 0 to `target` when the element enters viewport.
 * @param {number} target   — final number to count up to
 * @param {number} duration — animation duration in ms (default 1800)
 */
export function useCountUp(target, duration = 1800) {
  const isNumber = typeof target === 'number' && !isNaN(target)
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!isNumber) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, isNumber])

  return { count: isNumber ? count : target, ref }
}
