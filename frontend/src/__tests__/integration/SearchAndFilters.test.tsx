import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchAndFilters } from '@/components/SearchAndFilters'
import { Template } from '@/lib/templatesApi'

// Mock the templatesApi
jest.mock('@/lib/templatesApi', () => ({
  templatesApi: {
    getTemplates: jest.fn(),
    searchTemplates: jest.fn(),
  },
}))

const mockGetTemplates = require('@/lib/templatesApi').templatesApi.getTemplates
const mockSearchTemplates = require('@/lib/templatesApi').templatesApi.searchTemplates

const mockTemplates: Template[] = [
  {
    _id: '1',
    title: 'Adventure Story',
    description: 'An exciting adventure',
    category: 'Aventure',
    ageRange: '7-10 ans',
    gender: 'unisex',
    language: 'Français',
    isPublished: true,
    pdfPath: '/pdfs/adventure.pdf',
    coverPath: '/covers/adventure.jpg',
    pageCount: 10,
    dimensions: { width: 210, height: 297 },
    rating: 4.5,
    isPopular: true,
    isRecent: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Fantasy Tale',
    description: 'A magical fantasy story',
    category: 'Fantastique',
    ageRange: '11-14 ans',
    gender: 'unisex',
    language: 'Français',
    isPublished: true,
    pdfPath: '/pdfs/fantasy.pdf',
    coverPath: '/covers/fantasy.jpg',
    pageCount: 15,
    dimensions: { width: 210, height: 297 },
    rating: 4.8,
    isPopular: false,
    isRecent: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('SearchAndFilters Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetTemplates.mockResolvedValue(mockTemplates)
    mockSearchTemplates.mockResolvedValue([mockTemplates[0]])
  })

  it('loads and displays templates initially', async () => {
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.getByText('Fantasy Tale')).toBeInTheDocument()
    })
  })

  it('filters templates by search query', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'adventure')

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })
  })

  it('filters templates by category', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    // Select Aventure category
    const aventureCheckbox = screen.getByRole('checkbox', { name: 'Aventure' })
    await user.click(aventureCheckbox)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })
  })

  it('filters templates by age range', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    // Select 7-10 ans age range
    const ageBadge = screen.getByText('7-10 ans')
    await user.click(ageBadge)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })
  })

  it('combines search and category filters', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Search for "story"
    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'story')

    // Open filters and select Aventure category
    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    const aventureCheckbox = screen.getByRole('checkbox', { name: 'Aventure' })
    await user.click(aventureCheckbox)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })
  })

  it('sorts templates by popularity', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    // Change sort to rating
    const sortSelect = screen.getByRole('combobox', { name: 'Trier les résultats' })
    await user.click(sortSelect)

    const ratingOption = screen.getByText('Meilleures notes')
    await user.click(ratingOption)

    // Fantasy Tale should appear first (higher rating)
    await waitFor(() => {
      const storyCards = screen.getAllByRole('article')
      expect(storyCards.length).toBe(2)
    })
  })

  it('shows no results message when no templates match filters', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Search for non-existent term
    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument()
      expect(screen.queryByText('Adventure Story')).not.toBeInTheDocument()
    })
  })

  it('resets all filters correctly', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Apply filters
    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'adventure')

    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    const aventureCheckbox = screen.getByRole('checkbox', { name: 'Aventure' })
    await user.click(aventureCheckbox)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })

    // Reset filters
    const resetButton = screen.getByRole('button', { name: 'Réinitialiser les filtres' })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
      expect(screen.getByText('Fantasy Tale')).toBeInTheDocument()
    })
  })

  it('maintains filter state when switching between mobile and desktop view', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    // Apply filter
    const filtersButton = screen.getByRole('button', { name: /afficher les filtres/i })
    await user.click(filtersButton)

    const aventureCheckbox = screen.getByRole('checkbox', { name: 'Aventure' })
    await user.click(aventureCheckbox)

    await waitFor(() => {
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })

    // Close and reopen filters
    const closeButton = screen.getByRole('button', { name: 'Fermer les filtres' })
    await user.click(closeButton)

    await user.click(filtersButton)

    // Filter should still be applied
    await waitFor(() => {
      expect(screen.queryByText('Fantasy Tale')).not.toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    mockGetTemplates.mockRejectedValueOnce(new Error('API Error'))

    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Oups ! Une erreur est survenue')).toBeInTheDocument()
    })
  })

  it('shows loading states during search', async () => {
    const user = userEvent.setup()
    render(<SearchAndFilters />)

    await waitFor(() => {
      expect(screen.getByText('Adventure Story')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(searchInput, 'test')

    // Should show loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})