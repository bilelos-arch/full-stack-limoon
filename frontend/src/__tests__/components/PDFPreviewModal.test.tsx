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

describe('PDFPreviewModal', () => {
  const mockOnClose = jest.fn()
  const mockOnCustomize = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <PDFPreviewModal
        isOpen={false}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.queryByText('Aperçu: Test PDF')).not.toBeInTheDocument()
  })

  it('does not render when template is null', () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={null}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.queryByText('Aperçu:')).not.toBeInTheDocument()
  })

  it('renders modal with correct title and description', async () => {
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
  })

  it('loads and displays PDF content', async () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })
  })

  it('shows loading indicator while PDF is loading', () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    expect(screen.getByText('Chargement du PDF...')).toBeInTheDocument()
  })

  it('navigates to next page when next button is clicked', async () => {
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

    const nextButton = screen.getByRole('button', { name: 'Page suivante' })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Page 2 sur 5')).toBeInTheDocument()
    })
  })

  it('navigates to previous page when previous button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    // First go to page 2
    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })

    const nextButton = screen.getByRole('button', { name: 'Page suivante' })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Page 2 sur 5')).toBeInTheDocument()
    })

    // Then go back to page 1
    const prevButton = screen.getByRole('button', { name: 'Page précédente' })
    await user.click(prevButton)

    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 5')).toBeInTheDocument()
    })
  })

  it('zooms in when zoom in button is clicked', async () => {
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

    const zoomInButton = screen.getByRole('button', { name: 'Zoom avant' })
    await user.click(zoomInButton)

    await waitFor(() => {
      expect(screen.getByText('125%')).toBeInTheDocument()
    })
  })

  it('zooms out when zoom out button is clicked', async () => {
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

    const zoomOutButton = screen.getByRole('button', { name: 'Zoom arrière' })
    await user.click(zoomOutButton)

    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  it('toggles fullscreen when fullscreen button is clicked', async () => {
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
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    const closeButton = screen.getByRole('button', { name: 'Fermer l\'aperçu' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onCustomize when customize button is clicked', async () => {
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

  it('closes modal when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await user.keyboard('{Escape}')

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', async () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby', 'pdf-modal-title')
      expect(modal).toHaveAttribute('aria-describedby', 'pdf-modal-description')
    })
  })

  it('disables navigation buttons appropriately', async () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: 'Page précédente' })
      const nextButton = screen.getByRole('button', { name: 'Page suivante' })

      expect(prevButton).toBeDisabled()
      expect(nextButton).not.toBeDisabled()
    })
  })

  it('disables zoom buttons at limits', async () => {
    render(
      <PDFPreviewModal
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onCustomize={mockOnCustomize}
      />
    )

    await waitFor(() => {
      const zoomOutButton = screen.getByRole('button', { name: 'Zoom arrière' })
      expect(zoomOutButton).toBeDisabled()
    })
  })
})