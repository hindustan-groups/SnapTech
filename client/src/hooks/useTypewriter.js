import { useState, useEffect } from 'react'

/**
 * useTypewriter — cycles through an array of words with a typing animation.
 * Respects `prefers-reduced-motion: reduce`.
 *
 * @param {string[]} words - Array of strings to cycle through
 * @param {object} [options]
 * @param {number} [options.typeSpeed=70] - Speed in ms per character typing
 * @param {number} [options.deleteSpeed=30] - Speed in ms per character deleting
 * @param {number} [options.pauseDuration=2200] - Duration to hold full word in ms
 * @param {number} [options.pauseBeforeType=200] - Pause between words in ms
 * @param {boolean} [options.isPaused=false] - Pause the animation (e.g. while user is typing)
 * @returns {string} The currently displayed animated text
 */
export function useTypewriter(words = [], options = {}) {
  const {
    typeSpeed = 70,
    deleteSpeed = 30,
    pauseDuration = 2200,
    pauseBeforeType = 200,
    isPaused = false,
  } = options

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const firstWord = words[0] ? `${words[0]}...` : ''
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState(firstWord)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion || isPaused || !words.length) return

    const currentWord = words[currentWordIndex % words.length]
    const fullText = `${currentWord}...`
    let timer

    if (!isDeleting) {
      if (displayedText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1))
        }, typeSpeed)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, deleteSpeed)
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }, pauseBeforeType)
      }
    }

    return () => clearTimeout(timer)
  }, [
    displayedText,
    isDeleting,
    currentWordIndex,
    words,
    isPaused,
    prefersReducedMotion,
    typeSpeed,
    deleteSpeed,
    pauseDuration,
    pauseBeforeType,
  ])

  if (prefersReducedMotion) {
    return firstWord
  }

  return displayedText
}
