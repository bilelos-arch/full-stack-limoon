import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/SearchBar'

// Mock the templatesApi
jest.mock('@/lib/templatesApi', () => ({
  templatesApi: {
    searchTemplates: jest.fn(),
  },
}))

const mockSearchTemplates = require('@/lib/templatesApi').templatesApi.searchTemplates

describe('SearchBar', () => {
  const mockOnSearchChange = jest.fn()
  const mockOnSuggestionSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input with correct placeholder', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    )

    const input = screen.getByPlaceholderText('Rechercher des histoires...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'search')
  })

  it('calls onSearchChange when user types', async () => {
    const user = userEvent.setup()
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    )

    const input = screen.getByPlaceholderText('Rechercher des histoires...')
    await user.type(input, 'test query')

    expect(mockOnSearchChange).toHaveBeenCalledWith('test query')
  })

  it('shows loading indicator when isLoading is true', () => {
    render(
      <SearchBar
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
        isLoading={true}
      />
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays suggestions when available', async () => {
    const mockSuggestions = [
      { _id: '1', title: 'Test Story 1', description: 'Description 1', category: 'Fiction' },
      { _id: '2', title: 'Test Story 2', description: 'Description 2', category: 'Non-Fiction' },
    ]

    mockSearchTemplates.mockResolvedValue(mockSuggestions)

    render(
      <SearchBar
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
        suggestions={mockSuggestions}
        showSuggestions={true}
        isSearchFocused={true}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Story 1')).toBeInTheDocument()
      expect(screen.getByText('Test Story 2')).toBeInTheDocument()
    })

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('calls onSuggestionSelect when suggestion is clicked', async () => {
    const user = userEvent.setup()
    const mockSuggestions = [
      { _id: '1', title: 'Test Story 1', description: 'Description 1', category: 'Fiction' },
    ]

    render(
      <SearchBar
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
        suggestions={mockSuggestions}
        showSuggestions={true}
        isSearchFocused={true}
      />
    )

    const suggestion = await screen.findByText('Test Story 1')
    await user.click(suggestion)

    expect(mockOnSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0])
  })

  it('has proper accessibility attributes', () => {
    render(
      <SearchBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    )

    const input = screen.getByPlaceholderText('Rechercher des histoires...')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-haspopup', 'list')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-describedby', 'search-help')
  })

  it('shows suggestions with expanded aria attributes', () => {
    const mockSuggestions = [
      { _id: '1', title: 'Test Story 1', description: 'Description 1', category: 'Fiction' },
    ]

    render(
      <SearchBar
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
        suggestions={mockSuggestions}
        showSuggestions={true}
        isSearchFocused={true}
      />
    )

    const input = screen.getByPlaceholderText('Rechercher des histoires...')
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('hides suggestions when showSuggestions is false', () => {
    const mockSuggestions = [
      { _id: '1', title: 'Test Story 1', description: 'Description 1', category: 'Fiction' },
    ]

    render(
      <SearchBar
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        onSuggestionSelect={mockOnSuggestionSelect}
        suggestions={mockSuggestions}
        showSuggestions={false}
        isSearchFocused={true}
      />
    )

    expect(screen.queryByText('Test Story 1')).not.toBeInTheDocument()
  })
})