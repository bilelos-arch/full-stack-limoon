import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PDFPreviewModal from '@/components/PDFPreviewModal'
import { Template } from '@/lib/templatesApi'

// Mock PDF.js
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 5,
      getPage: jest.fn(() => ({
        getViewport: jest.fn(() => ({ width: 600, height: 800 })),
        render: jest.fn(() => ({
          promise: Promise.resolve(),
        })),
      })),
    }),
  })),
}))

const mockTemplate: Template = {
  _id: '1',
  title: 'Test PDF',
  description: 'A test PDF description',
  category: 'Fiction',
  ageRange: '7-10 ans',
  gender: 'Unisexe',
  language: 'Français',
  isPublished: true,
  pdfPath: '/pdfs/test.pdf',
  coverPath: '/covers/test.jpg',
  pageCount: 5,
  dimensions: { width: 210, height: 297 },
  rating: 4.5,
  isPopular: true,
  isRecent: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('PDFPreviewModal Integration', () => {
  const mockOnClose = jest.fn()
  const mockOnCustomize = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('integrates with template data and displays PDF correctly', async () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Aperçu: Test PDF')).toBeInTheDocument()
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })

    // Check that PDF content is rendered
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('handles navigation between pages with keyboard and mouse', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })

    // Navigate with mouse
    const nextButton = screen.getByRole('button', { name: 'Page suivante' })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Page 2 sur 5')).toBeInTheDocument()
    })

    // Navigate back
    const prevButton = screen.getByRole('button', { name: 'Page précédente' })
    await user.click(prevButton)

    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })
  })

  it('handles zoom functionality with buttons and limits', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: 'Zoom avant' })
    await user.click(zoomInButton)

    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument()
    })

    // Zoom out
    const zoomOutButton = screen.getByRole('button', { name: 'Zoom arrière' })
    await user.click(zoomOutButton)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // Test zoom limits
    for (let i = 0; i < 10; i++) {
      await user.click(zoomOutButton)
    }

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    expect(zoomOutButton).toBeDisabled()
  })

  it('handles fullscreen toggle and modal state changes', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    const fullscreenButton = screen.getByRole('button', { name: 'Plein écran' })
    await user.click(fullscreenButton)

    expect(fullscreenButton).toHaveAttribute('aria-label', 'Quitter le plein écran')

    // Click again to exit fullscreen
    await user.click(fullscreenButton)
    expect(fullscreenButton).toHaveAttribute('aria-label', 'Plein écran')
  })

  it('closes modal and calls onCustomize when customize button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    const customizeButton = screen.getByRole('button', { name: 'Personnaliser Test PDF' })
    await user.click(customizeButton)

    expect(mockOnCustomize).toHaveBeenCalledWith(mockTemplate)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles keyboard navigation and focus management', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    // Test Escape key
    await user.keyboard('{Escape}')
    expect(mockOnClose).toHaveBeenCalled()

    // Reset mock
    mockOnClose.mockClear()

    // Test Tab navigation (focus trap)
    const firstFocusable = screen.getByRole('button', { name: 'Page précédente' })
    expect(firstFocusable).toHaveFocus()
  })

  it('maintains accessibility attributes throughout interactions', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    const modal = await screen.findByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby', 'pdf-modal-title')
    expect(modal).toHaveAttribute('aria-describedby', 'pdf-modal-description')

    // Navigate and check attributes remain
    const nextButton = screen.getByRole('button', { name: 'Page suivante' })
    await user.click(nextButton)

    expect(modal).toHaveAttribute('aria-modal', 'true')
  })

  it('handles PDF loading errors gracefully', async () => {
    // Mock PDF loading failure
    const mockGetDocument = require('pdfjs-dist').getDocument
    mockGetDocument.mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('PDF loading failed')),
    }))

    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    // Should still render modal structure even if PDF fails
    await waitFor(() => {
      expect(screen.getByText('Aperçu: Test PDF')).toBeInTheDocument()
    })

    // Error should be logged but not crash the component
    expect(console.error).toHaveBeenCalled()
  })

  it('updates page display when navigating through multiple pages', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })

    // Navigate through all pages
    const nextButton = screen.getByRole('button', { name: 'Page suivante' })

    for (let page = 2; page <= 5; page++) {
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(`Page ${page} sur 5`)).toBeInTheDocument()
      })
    }

    // Next button should be disabled on last page
    expect(nextButton).toBeDisabled()
  })

  it('preserves zoom level when changing pages', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // Zoom in
    const zoomInButton = screen.getByRole('button', { name: 'Zoom avant' })
    await user.click(zoomInButton)

    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument()
    })

    // Navigate to next page
    const nextButton = screen.getByRole('button', { name: 'Page suivante' })
    await user.click(nextButton)

    // Zoom should be preserved
    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument()
    })
  })
})