import { render } from '@testing-library/react'
import axe from 'axe-core'
import { SearchBar } from '@/components/SearchBar'
import { StoryCard } from '@/components/StoryCard'
import { FiltersPanel } from '@/components/FiltersPanel'
import PDFPreviewModal from '@/components/PDFPreviewModal'
import { Template } from '@/lib/templatesApi'

// Mock axe
jest.mock('axe-core', () => ({
  run: jest.fn(),
  configure: jest.fn(),
}))

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

describe('Accessibility Tests', () => {
  const mockAxeRun = axe.run as jest.MockedFunction<typeof axe.run>

  beforeEach(() => {
    mockAxeRun.mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('SearchBar Accessibility', () => {
    it('should pass accessibility checks', async () => {
      const mockOnSearchChange = jest.fn()
      const mockOnSuggestionSelect = jest.fn()

      const { container } = render(
        <SearchBar
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onSuggestionSelect={mockOnSuggestionSelect}
        />
      )

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should have proper ARIA attributes for search input', () => {
      const mockOnSearchChange = jest.fn()
      const mockOnSuggestionSelect = jest.fn()

      const { getByPlaceholderText } = render(
        <SearchBar
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onSuggestionSelect={mockOnSuggestionSelect}
        />
      )

      const input = getByPlaceholderText('Rechercher des histoires...')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(input).toHaveAttribute('aria-haspopup', 'listbox')
      expect(input).toHaveAttribute('aria-autocomplete', 'list')
      expect(input).toHaveAttribute('aria-describedby', 'search-help')
    })

    it('should have accessible help text', () => {
      const mockOnSearchChange = jest.fn()
      const mockOnSuggestionSelect = jest.fn()

      const { getByText } = render(
        <SearchBar
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          onSuggestionSelect={mockOnSuggestionSelect}
        />
      )

      const helpText = getByText('Tapez pour rechercher des histoires. Utilisez les flèches haut/bas pour naviguer dans les suggestions, Entrée pour sélectionner.')
      expect(helpText).toHaveAttribute('id', 'search-help')
      expect(helpText).toHaveClass('sr-only')
    })
  })

  describe('StoryCard Accessibility', () => {
    it('should pass accessibility checks', async () => {
      const mockOnPreview = jest.fn()
      const mockOnCustomize = jest.fn()

      const { container } = render(
        <StoryCard
          template={mockTemplate}
          onPreview={mockOnPreview}
          onCustomize={mockOnCustomize}
        />
      )

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should have proper semantic structure', () => {
      const mockOnPreview = jest.fn()
      const mockOnCustomize = jest.fn()

      const { getByRole } = render(
        <StoryCard
          template={mockTemplate}
          onPreview={mockOnPreview}
          onCustomize={mockOnCustomize}
        />
      )

      const article = getByRole('article')
      expect(article).toHaveAttribute('aria-labelledby', 'template-title-1')
      expect(article).toHaveAttribute('aria-describedby', 'template-desc-1')
    })

    it('should have accessible buttons with proper labels', () => {
      const mockOnPreview = jest.fn()
      const mockOnCustomize = jest.fn()

      const { getByRole } = render(
        <StoryCard
          template={mockTemplate}
          onPreview={mockOnPreview}
          onCustomize={mockOnCustomize}
        />
      )

      const previewButton = getByRole('button', { name: 'Aperçu de Test Story' })
      const customizeButton = getByRole('button', { name: 'Personnaliser Test Story' })

      expect(previewButton).toBeInTheDocument()
      expect(customizeButton).toBeInTheDocument()
    })

    it('should have descriptive alt text for images', () => {
      const mockOnPreview = jest.fn()
      const mockOnCustomize = jest.fn()

      const { getByAltText } = render(
        <StoryCard
          template={mockTemplate}
          onPreview={mockOnPreview}
          onCustomize={mockOnCustomize}
        />
      )

      const image = getByAltText('Couverture du template d\'histoire "Test Story" - A test story description')
      expect(image).toBeInTheDocument()
    })
  })

  describe('FiltersPanel Accessibility', () => {
    it('should pass accessibility checks', async () => {
      const mockOnFiltersChange = jest.fn()

      const { container } = render(
        <FiltersPanel
          filters={{
            searchQuery: '',
            selectedCategories: [],
            selectedAges: [],
            selectedLanguage: '',
            selectedGenres: [],
            selectedTags: [],
            sortBy: 'popular',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should have proper form structure and labels', () => {
      const mockOnFiltersChange = jest.fn()

      const { getByRole, getByLabelText } = render(
        <FiltersPanel
          filters={{
            searchQuery: '',
            selectedCategories: [],
            selectedAges: [],
            selectedLanguage: '',
            selectedGenres: [],
            selectedTags: [],
            sortBy: 'popular',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const complementary = getByRole('complementary', { name: 'Filtres de recherche' })
      expect(complementary).toBeInTheDocument()

      // Check form labels
      expect(getByLabelText('Recherche')).toBeInTheDocument()
      expect(getByLabelText('Catégories')).toBeInTheDocument()
      expect(getByLabelText('Tranche d\'âge')).toBeInTheDocument()
      expect(getByLabelText('Langue')).toBeInTheDocument()
      expect(getByLabelText('Genres')).toBeInTheDocument()
      expect(getByLabelText('Tags')).toBeInTheDocument()
      expect(getByLabelText('Trier par')).toBeInTheDocument()
    })

    it('should have keyboard accessible interactive elements', () => {
      const mockOnFiltersChange = jest.fn()

      const { getByText } = render(
        <FiltersPanel
          filters={{
            searchQuery: '',
            selectedCategories: [],
            selectedAges: [],
            selectedLanguage: '',
            selectedGenres: [],
            selectedTags: [],
            sortBy: 'popular',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Age badges should be keyboard accessible
      const ageBadge = getByText('7-10 ans')
      expect(ageBadge).toHaveAttribute('role', 'button')
      expect(ageBadge).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('PDFPreviewModal Accessibility', () => {
    it('should pass accessibility checks', async () => {
      const mockOnClose = jest.fn()
      const mockOnCustomize = jest.fn()

      const { container } = render(
        <PDFPreviewModal
          isOpen={true}
          onClose={mockOnClose}
          template={mockTemplate}
          onCustomize={mockOnCustomize}
        />
      )

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should have proper modal structure', async () => {
      const mockOnClose = jest.fn()
      const mockOnCustomize = jest.fn()

      const { findByRole } = render(
        <PDFPreviewModal
          isOpen={true}
          onClose={mockOnClose}
          template={mockTemplate}
          onCustomize={mockOnCustomize}
        />
      )

      const dialog = await findByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'pdf-modal-title')
      expect(dialog).toHaveAttribute('aria-describedby', 'pdf-modal-description')
    })

    it('should trap focus within modal', async () => {
      const mockOnClose = jest.fn()
      const mockOnCustomize = jest.fn()

      const { findByRole } = render(
        <PDFPreviewModal
          isOpen={true}
          onClose={mockOnClose}
          template={mockTemplate}
          onCustomize={mockOnCustomize}
        />
      )

      const dialog = await findByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('should have accessible navigation buttons', async () => {
      const mockOnClose = jest.fn()
      const mockOnCustomize = jest.fn()

      const { findByRole } = render(
        <PDFPreviewModal
          isOpen={true}
          onClose={mockOnClose}
          template={mockTemplate}
          onCustomize={mockOnCustomize}
        />
      )

      const prevButton = await findByRole('button', { name: 'Page précédente' })
      const nextButton = await findByRole('button', { name: 'Page suivante' })
      const zoomInButton = await findByRole('button', { name: 'Zoom avant' })
      const zoomOutButton = await findByRole('button', { name: 'Zoom arrière' })

      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
      expect(zoomInButton).toBeInTheDocument()
      expect(zoomOutButton).toBeInTheDocument()
    })

    it('should close on Escape key press', async () => {
      const mockOnClose = jest.fn()
      const mockOnCustomize = jest.fn()

      render(
        <PDFPreviewModal
          isOpen={true}
          onClose={mockOnClose}
          template={mockTemplate}
          onCustomize={mockOnCustomize}
        />
      )

      // Simulate Escape key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Combined Component Accessibility', () => {
    it('should ensure all components work together accessibly', async () => {
      const mockOnSearchChange = jest.fn()
      const mockOnSuggestionSelect = jest.fn()
      const mockOnPreview = jest.fn()
      const mockOnCustomize = jest.fn()
      const mockOnFiltersChange = jest.fn()
      const mockOnClose = jest.fn()

      const { container } = render(
        <div>
          <SearchBar
            searchQuery=""
            onSearchChange={mockOnSearchChange}
            onSuggestionSelect={mockOnSuggestionSelect}
          />
          <StoryCard
            template={mockTemplate}
            onPreview={mockOnPreview}
            onCustomize={mockOnCustomize}
          />
          <FiltersPanel
            filters={{
              searchQuery: '',
              selectedCategories: [],
              selectedAges: [],
              selectedLanguage: '',
              selectedGenres: [],
              selectedTags: [],
              sortBy: 'popular',
            }}
            onFiltersChange={mockOnFiltersChange}
          />
          <PDFPreviewModal
            isOpen={false}
            onClose={mockOnClose}
            template={mockTemplate}
            onCustomize={mockOnCustomize}
          />
        </div>
      )

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})