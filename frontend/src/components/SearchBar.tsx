'use client'

import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { templatesApi, Template } from '@/lib/templatesApi'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onSuggestionSelect: (template: Template) => void
  suggestions?: Template[]
  showSuggestions?: boolean
  isLoading?: boolean
  isSearchFocused?: boolean
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onSuggestionSelect,
  suggestions = [],
  showSuggestions = false,
  isLoading = false,
  isSearchFocused = false,
}: SearchBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // React Query for search suggestions
  const { data: searchResults, refetch: refetchSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => templatesApi.searchTemplates(searchQuery, 5),
    enabled: false, // Only run when manually triggered
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      return
    }

    try {
      await refetchSearch()
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Erreur de recherche', {
        description: 'Impossible de rechercher les histoires. Veuillez réessayer.',
      })
    }
  }, [refetchSearch])

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    onSearchChange(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (template: Template) => {
    onSearchChange(template.title)
    onSuggestionSelect(template)
  }

  const clearSearch = () => {
    onSearchChange('')
    searchInputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div
        className="relative"
        role="search"
        aria-label="Rechercher des histoires"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Rechercher des histoires..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-lg"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby="search-help"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" aria-hidden="true"></div>
          </div>
        )}
        <div id="search-help" className="sr-only">
          Tapez pour rechercher des histoires. Utilisez les flèches haut/bas pour naviguer dans les suggestions, Entrée pour sélectionner.
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            role="listbox"
            aria-label="Suggestions de recherche"
          >
            {suggestions.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                onClick={() => handleSuggestionSelect(template)}
                role="option"
                aria-selected={false}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <span className="text-xs">📚</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{template.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{template.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}