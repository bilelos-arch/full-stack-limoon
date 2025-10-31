import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FiltersPanel } from '@/components/FiltersPanel'

describe('FiltersPanel', () => {
  const mockOnFiltersChange = jest.fn()
  const defaultFilters = {
    searchQuery: '',
    selectedCategories: [],
    selectedAges: [],
    selectedLanguage: '',
    selectedGenres: [],
    selectedTags: [],
    sortBy: 'popular',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all filter sections', () => {
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    expect(screen.getByText('Filtres')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Tranche d\'âge')).toBeInTheDocument()
    expect(screen.getByText('Langue')).toBeInTheDocument()
    expect(screen.getByText('Genres')).toBeInTheDocument()
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Trier par')).toBeInTheDocument()
  })

  it('calls onFiltersChange when search input changes', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'test query')

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      searchQuery: 'test query',
    })
  })

  it('toggles category selection correctly', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const fictionCheckbox = screen.getByRole('checkbox', { name: 'Fiction' })
    await user.click(fictionCheckbox)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedCategories: ['Fiction'],
    })

    // Click again to deselect
    await user.click(fictionCheckbox)
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedCategories: [],
    })
  })

  it('toggles age range selection correctly', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const ageBadge = screen.getByText('3-6 ans')
    await user.click(ageBadge)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedAges: ['3-6 ans'],
    })
  })

  it('changes language selection', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const languageSelect = screen.getByRole('combobox', { name: 'Sélectionner une langue' })
    await user.click(languageSelect)

    const frenchOption = screen.getByText('Français')
    await user.click(frenchOption)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedLanguage: 'Français',
    })
  })

  it('toggles genre selection correctly', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const adventureCheckbox = screen.getByRole('checkbox', { name: 'Aventure' })
    await user.click(adventureCheckbox)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedGenres: ['Aventure'],
    })
  })

  it('toggles tag selection correctly', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const magicTag = screen.getByText('Magique')
    await user.click(magicTag)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      selectedTags: ['Magique'],
    })
  })

  it('changes sort selection', async () => {
    const user = userEvent.setup()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const sortSelect = screen.getByRole('combobox', { name: 'Trier les résultats' })
    await user.click(sortSelect)

    const recentOption = screen.getByText('Plus récents')
    await user.click(recentOption)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortBy: 'recent',
    })
  })

  it('resets all filters when reset button is clicked', async () => {
    const user = userEvent.setup()
    const activeFilters = {
      ...defaultFilters,
      searchQuery: 'test',
      selectedCategories: ['Fiction'],
      selectedAges: ['3-6 ans'],
      selectedLanguage: 'Français',
      selectedGenres: ['Aventure'],
      selectedTags: ['Magique'],
      sortBy: 'rating',
    }

    render(
      <FiltersPanel
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    const resetButton = screen.getByRole('button', { name: 'Réinitialiser tous les filtres' })
    await user.click(resetButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      searchQuery: '',
      selectedCategories: [],
      selectedAges: [],
      selectedLanguage: '',
      selectedGenres: [],
      selectedTags: [],
      sortBy: 'popular',
    })
  })

  it('has proper accessibility attributes', () => {
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    )

    expect(screen.getByRole('complementary', { name: 'Filtres de recherche' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fermer les filtres' })).toBeInTheDocument()
  })

  it('shows close button when onClose is provided', () => {
    const mockOnClose = jest.fn()
    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button', { name: 'Fermer les filtres' })
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(
      <FiltersPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button', { name: 'Fermer les filtres' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})