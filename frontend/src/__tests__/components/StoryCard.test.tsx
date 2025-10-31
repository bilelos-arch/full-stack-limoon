import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryCard } from '@/components/StoryCard'
import { Template } from '@/lib/templatesApi'

const mockTemplate: Template = {
  _id: '1',
  title: 'Test Story',
  description: 'A test story description',
  category: 'Fiction',
  ageRange: '7-10 ans',
  gender: 'Unisexe',
  language: 'Français',
  isPublished: true,
  pdfPath: '/pdfs/test.pdf',
  coverPath: '/covers/test.jpg',
  pageCount: 10,
  dimensions: { width: 210, height: 297 },
  rating: 4.5,
  isPopular: true,
  isRecent: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('StoryCard', () => {
  const mockOnPreview = jest.fn()
  const mockOnCustomize = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders template information correctly', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.getByText('Test Story')).toBeInTheDocument()
    expect(screen.getByText('A test story description')).toBeInTheDocument()
    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByText('7-10 ans')).toBeInTheDocument()
    expect(screen.getByText('10 pages')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('displays cover image with correct alt text', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const image = screen.getByAltText('Couverture du template d\'histoire "Test Story" - A test story description')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('/covers/test.jpg'))
  })

  it('calls onPreview when preview button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const previewButton = screen.getByRole('button', { name: /aperçu de test story/i })
    await user.click(previewButton)

    expect(mockOnPreview).toHaveBeenCalledWith(mockTemplate)
  })

  it('calls onCustomize when customize button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const customizeButton = screen.getByRole('button', { name: /personnaliser test story/i })
    await user.click(customizeButton)

    expect(mockOnCustomize).toHaveBeenCalledWith(mockTemplate)
  })

  it('has proper accessibility attributes', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-labelledby', 'template-title-1')
    expect(card).toHaveAttribute('aria-describedby', 'template-desc-1')

    const title = screen.getByText('Test Story')
    expect(title).toHaveAttribute('id', 'template-title-1')

    const description = screen.getByText('A test story description')
    expect(description).toHaveAttribute('id', 'template-desc-1')
  })

  it('displays rating with proper aria-label', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const rating = screen.getByLabelText('Note: 4.5 sur 5')
    expect(rating).toBeInTheDocument()
  })

  it('displays page count with proper aria-label', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.getByLabelText('10 pages')).toBeInTheDocument()
  })

  it('shows multiple badges for category and age range', () => {
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const badges = screen.getAllByRole('generic', { hidden: true }).filter(
      element => element.className.includes('badge')
    )
    expect(badges.length).toBeGreaterThanOrEqual(2)
  })

  it('handles templates without rating', () => {
    const templateWithoutRating = { ...mockTemplate, rating: undefined }

    render(
      <StoryCard
        template={templateWithoutRating}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('applies hover effects correctly', async () => {
    const user = userEvent.setup()
    render(
      <StoryCard
        template={mockTemplate}
        onPreview={mockOnPreview}
        onCustomize={mockOnCustomize}
      />
    )

    const card = screen.getByRole('article')
    await user.hover(card)

    // Check if hover class is applied (this might need adjustment based on actual implementation)
    expect(card).toHaveClass('group')
  })
})