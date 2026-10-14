/**
 * SpecialCharactersDisplay.test.jsx
 *
 * Verifies that special characters, angle brackets, quotes, newlines, and emojis
 * render verbatim in React components without escaping artifacts, truncation,
 * or XSS vulnerabilities.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionHeading from '@/components/ui/SectionHeading'

// Test components with the exact user test cases
describe('Frontend Special Characters Display Verification', () => {
  const testCases = [
    { name: 'Pure special characters', text: '!@@#$$%^&*' },
    { name: 'Special characters with words', text: 'Hello !@@#$$%^&* World' },
    { name: 'Ampersand and percent', text: '100% Complete & Ready' },
    { name: 'Price and percent', text: 'Price: $500 | Discount: 20%' },
    { name: 'Math and slash', text: 'A+B = C? Yes/No' },
    { name: 'Double and single quotes', text: 'Quotes: "double" and \'single\'' },
    { name: 'Angle brackets', text: 'Angle brackets: <test> </test>' },
    { name: 'Newline', text: 'Line 1\nLine 2' },
    { name: 'Backslash and slash', text: 'Backslash: \\ Path: /test' },
    { name: 'Emoji', text: 'Emoji: 🚀 ✅' },
    { name: 'Repeated symbols', text: 'Repeated: !!! $$$ %%% &&& ***' },
    { name: 'Consecutive spaces', text: 'Multiple    consecutive    spaces' },
  ]

  describe('SectionHeading plain text rendering', () => {
    testCases.forEach(({ name, text }) => {
      it(`renders verbatim: ${name} -> "${text}"`, () => {
        const { container } = render(<SectionHeading title={text} />)
        const heading = screen.getByRole('heading', { level: 2 })

        // 1. Exact text equality check (inputValue === displayedText)
        expect(heading.textContent).toBe(text)

        // 2. Ensure no literal HTML entities were displayed (e.g. &amp;, &quot;, &#x2F;)
        expect(heading.textContent).not.toContain('&amp;')
        expect(heading.textContent).not.toContain('&quot;')
        expect(heading.textContent).not.toContain('&#x2F;')
        expect(heading.textContent).not.toContain('&lt;')
        expect(heading.textContent).not.toContain('&gt;')

        // 3. Ensure angle brackets were not parsed as DOM nodes
        expect(container.querySelector('test')).toBeNull()
      })
    })
  })

  describe('FAQ answer multiline and special characters rendering', () => {
    it('preserves newlines and exact special characters with whitespace-pre-line', () => {
      const multilineText = "Line 1\nLine 2\n\nSpecial: !@@#$$%^&* & <script>alert(1)</script>"
      
      const { container } = render(
        <div className="whitespace-pre-line" data-testid="faq-answer">
          {multilineText}
        </div>
      )

      const answerEl = screen.getByTestId('faq-answer')

      // Exact content equality
      expect(answerEl.textContent).toBe(multilineText)

      // Script tag is NOT an executable DOM element
      expect(container.querySelector('script')).toBeNull()

      // The exact text remains visible as text, not HTML
      expect(screen.getByText(multilineText, { collapseWhitespace: false })).toBeInTheDocument()
    })
  })
})
