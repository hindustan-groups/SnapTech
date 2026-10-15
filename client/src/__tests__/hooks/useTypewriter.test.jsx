import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '@/hooks/useTypewriter'

describe('useTypewriter hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('initializes with the first word followed by ellipsis', () => {
    const words = ['Web Development', 'Mobile Apps']
    const { result } = renderHook(() => useTypewriter(words))
    expect(result.current).toBe('Web Development...')
  })

  it('returns empty string when words list is empty', () => {
    const { result } = renderHook(() => useTypewriter([]))
    expect(result.current).toBe('')
  })

  it('cycles through words and types character by character', () => {
    const words = ['Web', 'App']
    const { result } = renderHook(() =>
      useTypewriter(words, { typeSpeed: 50, deleteSpeed: 20, pauseDuration: 1000, pauseBeforeType: 100 })
    )

    expect(result.current).toBe('Web...')

    // Advance 1000ms pause to start deleting
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Advance timers character by character through delete & pause
    // "Web..." is 6 chars -> 6 * 20ms = 120ms + 100ms pause = 220ms
    for (let i = 0; i < 15; i++) {
      act(() => {
        vi.advanceTimersByTime(50)
      })
    }

    // Should have transitioned towards second word "App..."
    expect(result.current).toContain('A')
  })

  it('does not animate when isPaused is true', () => {
    const words = ['Web Development', 'Mobile Apps']
    const { result } = renderHook(() => useTypewriter(words, { isPaused: true }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current).toBe('Web Development...')
  })

  it('respects prefers-reduced-motion', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const words = ['Web Development', 'Mobile Apps']
    const { result } = renderHook(() => useTypewriter(words))

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current).toBe('Web Development...')

    window.matchMedia = originalMatchMedia
  })
})
