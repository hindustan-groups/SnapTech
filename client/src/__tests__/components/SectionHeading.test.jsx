/**
 * SectionHeading.test.jsx — Unit tests for the SectionHeading component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionHeading from '@/components/ui/SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as an h2', () => {
    render(<SectionHeading title="Our Services" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Our Services' })).toBeInTheDocument()
  })

  it('does NOT render eyebrow when not provided', () => {
    render(<SectionHeading title="Our Services" />)
    // No eyebrow span should exist
    const headingEl = screen.getByRole('heading', { level: 2 })
    expect(headingEl.previousSibling).toBeNull()
  })

  it('renders eyebrow text when provided', () => {
    render(<SectionHeading eyebrow="What We Do" title="Our Services" />)
    expect(screen.getByText('What We Do')).toBeInTheDocument()
  })

  it('applies text-brand-blue class to eyebrow', () => {
    render(<SectionHeading eyebrow="What We Do" title="Our Services" />)
    const eyebrow = screen.getByText('What We Do')
    expect(eyebrow.className).toContain('text-brand-blue')
  })

  it('renders subtitle when provided', () => {
    render(
      <SectionHeading
        title="Our Services"
        subtitle="We provide world-class IT services."
      />
    )
    expect(screen.getByText('We provide world-class IT services.')).toBeInTheDocument()
  })

  it('does NOT render subtitle when not provided', () => {
    render(<SectionHeading title="Our Services" />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('applies center alignment by default', () => {
    const { container } = render(<SectionHeading title="Test" />)
    expect(container.firstChild.className).toContain('text-center')
  })

  it('applies left alignment when align="left"', () => {
    const { container } = render(<SectionHeading title="Test" align="left" />)
    expect(container.firstChild.className).toContain('text-left')
  })

  it('applies light mode styles when light prop is true', () => {
    render(<SectionHeading title="Light Title" light />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.className).toContain('!text-white')
  })

  it('applies brand dark navy title color in dark (default) mode', () => {
    render(<SectionHeading title="Dark Title" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.className).toContain('text-[#0D1B4B]')
  })

  it('merges custom className on the wrapper', () => {
    const { container } = render(<SectionHeading title="Test" className="mb-16" />)
    expect(container.firstChild.className).toContain('mb-16')
  })
})
