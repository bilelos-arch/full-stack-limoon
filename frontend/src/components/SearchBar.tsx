'use client'

import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

  const { refetch: refetchSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => templatesApi.searchTemplates(searchQuery, 5),
    enabled: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  })

  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    try {
      await refetchSearch()
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Erreur de recherche')
    }
  }, [refetchSearch])

  const handleSearchChange = (value: string) => {
    onSearchChange(value)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value)
    }, 300)
  }

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
      <div className="relative" role="search">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Rechercher des histoires..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-11 pr-11 h-11 bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-[#0055FF]/20"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0055FF]"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.map((template) => (
              <div
                key={template._id}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
                onClick={() => handleSuggestionSelect(template)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0055FF]/10 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">📚</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 line-clamp-1">{template.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 font-light">{template.description}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-light px-2 py-1 bg-slate-50 rounded">
                    {template.category}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}