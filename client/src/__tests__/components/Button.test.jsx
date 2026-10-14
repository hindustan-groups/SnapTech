/**
 * Button.test.jsx — Unit tests for the Button UI component
 *
 * Tests: variants, sizes, disabled state, loading state, click handler,
 * fullWidth, custom className, left/right icons
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

// ─────────────────────────────────────────────────────────────
describe('Button — rendering', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('renders children text correctly', () => {
    render(<Button>Get a Quote</Button>)
    expect(screen.getByText('Get a Quote')).toBeInTheDocument()
  })

  it('applies primary variant classes (brand-blue)', () => {
    const { container } = render(<Button variant="primary">Primary</Button>)
    const btn = container.querySelector('button')
    expect(btn.className).toContain('bg-brand-blue')
  })

  it('applies secondary variant classes (dark navy)', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    const btn = container.querySelector('button')
    expect(btn.className).toContain('bg-[#0D1B4B]')
  })

  it('applies outline variant classes', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    const btn = container.querySelector('button')
    expect(btn.className).toContain('border-brand-blue')
    expect(btn.className).toContain('bg-transparent')
  })

  it('applies outline-red variant (fallback to brand-blue)', () => {
    const { container } = render(<Button variant="outline-red">Outline Red</Button>)
    const btn = container.querySelector('button')
    expect(btn.className).toContain('text-brand-blue')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — sizes', () => {
  it('applies sm size classes', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    expect(container.querySelector('button').className).toContain('px-4')
  })

  it('applies md size classes (default)', () => {
    const { container } = render(<Button size="md">Medium</Button>)
    expect(container.querySelector('button').className).toContain('px-6')
  })

  it('applies lg size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>)
    expect(container.querySelector('button').className).toContain('px-8')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — disabled state', () => {
  it('has disabled HTML attribute when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies opacity class when disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    expect(container.querySelector('button').className).toContain('opacity-50')
  })

  it('applies cursor-not-allowed when disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    expect(container.querySelector('button').className).toContain('cursor-not-allowed')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — loading state', () => {
  it('shows a loading indicator when loading', () => {
    const { container } = render(<Button loading>Loading</Button>)
    // Button is in loading state — disabled and spinner rendered
    const btn = container.querySelector('button')
    expect(btn.className).toContain('opacity-50')
    // Spinner is rendered as an SVG child inside the button
    expect(btn.querySelector('svg')).not.toBeNull()
  })

  it('does not render leftIcon when loading', () => {
    render(<Button loading leftIcon={<span data-testid="left-icon">★</span>}>Loading</Button>)
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
  })

  it('is visually disabled when loading', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('button').className).toContain('opacity-50')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — onClick', () => {
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does NOT call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)

    // pointer-events: none is applied — simulate the click anyway to verify
    // The button is actually disabled so no event fires
    fireEvent.click(screen.getByRole('button'))

    // disabled button should not fire the custom onClick
    expect(handleClick).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — fullWidth', () => {
  it('applies w-full class when fullWidth is true', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>)
    expect(container.querySelector('button').className).toContain('w-full')
  })

  it('does NOT apply w-full by default', () => {
    const { container } = render(<Button>Normal</Button>)
    expect(container.querySelector('button').className).not.toContain('w-full')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — icons', () => {
  it('renders leftIcon when provided', () => {
    render(<Button leftIcon={<span data-testid="left-icon">←</span>}>With Icon</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders rightIcon when provided', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>With Icon</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — type attribute', () => {
  it('defaults to type="button"', () => {
    render(<Button>Default</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('accepts type="submit" for form buttons', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

// ─────────────────────────────────────────────────────────────
describe('Button — custom className', () => {
  it('merges custom className with base classes', () => {
    const { container } = render(<Button className="my-custom-class">Custom</Button>)
    expect(container.querySelector('button').className).toContain('my-custom-class')
  })
})
