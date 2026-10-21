import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminProjectsPage from '@/pages/admin/AdminProjectsPage'
import { api } from '@/utils/api'

vi.mock('@/utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/components/ui', () => ({
  SEO: () => null,
  ImageUploader: ({ value, onChange }) => (
    <div data-testid="image-uploader">
      <input
        type="text"
        placeholder="Upload preview"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}))

describe('AdminProjectsPage — Custom Category Input', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminProjectsPage />
      </QueryClientProvider>
    )

  it('allows switching between dropdown select and custom category text box', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 'proj-1',
          title: 'Legacy Web App',
          clientName: 'Alpha Corp',
          category: 'Web',
          technologies: ['React'],
        },
      ],
    })

    renderComponent()

    // Wait for project data to load
    await waitFor(() => {
      expect(screen.getByText('Legacy Web App')).toBeInTheDocument()
    })

    // Click "Add New Project" button
    const addBtn = screen.getByRole('button', { name: /Add New Project/i })
    await user.click(addBtn)

    // Modal opens, category select exists initially
    expect(screen.getByText('+ Type custom category')).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: /Project Category/i })
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '+ Other / Type custom category...' })).toBeInTheDocument()

    // Click "+ Type custom category" button to toggle to text input
    await user.click(screen.getByText('+ Type custom category'))

    // Text input now visible with suggestion chips
    const customInput = screen.getByPlaceholderText(/e\.g\. AI & Automation/i)
    expect(customInput).toBeInTheDocument()
    expect(screen.getByText('← Choose from list')).toBeInTheDocument()

    // Test suggestion chip click
    const aiChip = screen.getByRole('button', { name: '+AI & Automation' })
    await user.click(aiChip)
    expect(customInput).toHaveValue('AI & Automation')

    // Test switching back to dropdown
    await user.click(screen.getByText('← Choose from list'))
    expect(screen.queryByPlaceholderText(/e\.g\. AI & Automation/i)).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Project Category/i })).toBeInTheDocument()
  })

  it('automatically opens text box when "+ Other / Type custom category..." is selected from dropdown', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValueOnce({ data: [] })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add First Project/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Add First Project/i }))

    const select = screen.getByRole('combobox', { name: /Project Category/i })
    await user.selectOptions(select, '__CUSTOM__')

    // Expect input to show up
    expect(screen.getByPlaceholderText(/e\.g\. AI & Automation/i)).toBeInTheDocument()
  })

  it('dynamically preserves and filters custom categories from existing projects', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          id: 'proj-ai',
          title: 'Predictive Inventory Engine',
          clientName: 'Beta Tech',
          category: 'AI & Machine Learning',
          technologies: ['Python', 'TensorFlow'],
        },
      ],
    })

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Predictive Inventory Engine')).toBeInTheDocument()
      expect(screen.getByText('AI & Machine Learning')).toBeInTheDocument()
    })

    // Toolbar category filter dropdown should include custom category
    const filterSelect = screen.getByRole('combobox', { name: /Filter by category/i })
    expect(filterSelect).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: /AI & Machine Learning \(1\)/i })
    ).toBeInTheDocument()
  })
})
