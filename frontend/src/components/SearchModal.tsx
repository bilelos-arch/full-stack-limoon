'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Template {
  _id: string;
  title: string;
  category?: string;
  previewImage?: string;
}

interface SearchResult {
  stories: Template[];
  templates: Template[];
  users: any[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => Promise<SearchResult | null>;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Utiliser le focus trap pour l'accessibilité
  const containerRef = useFocusTrap(isOpen, onClose);

  // Focus automatique quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Gestion de l'input avec debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        let searchResults: SearchResult | null = null;
        
        if (onSearch) {
          searchResults = await onSearch(query);
        } else {
          // Recherche par défaut
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (response.ok) {
            searchResults = await response.json();
          }
        }
        
        setResults(searchResults);
        setHasSearched(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults({ stories: [], templates: [], users: [] });
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // La recherche se fait automatiquement via le debouncing
  }, []);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults(null);
    setHasSearched(false);
    onClose();
  }, [onClose]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Animation variants - using inline animations to avoid TypeScript issues

  const resultItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        aria-hidden="true"
      >
        <div 
          ref={containerRef as React.RefObject<HTMLDivElement>}
          className="w-full max-w-2xl mx-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h2 id="search-modal-title" className="text-lg font-semibold">
              Recherche
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full hover:bg-muted"
              aria-label="Fermer la recherche"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des histoires, utilisateurs..."
                className="flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
                aria-label="Rechercher"
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </form>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Recherche en cours...</span>
              </div>
            )}

            {!isSearching && hasSearched && query.trim() && (
              <div className="p-4 space-y-4">
                {/* Stories Results */}
                {results?.stories && results.stories.length > 0 && (
                  <motion.div variants={resultItemVariants} initial="hidden" animate="visible">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Histoires ({results.stories.length})
                    </h4>
                    <div className="space-y-1">
                      {results.stories.map((story) => (
                        <motion.div
                          key={story._id}
                          variants={resultItemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link
                            href={`/histoires/hero/${story._id}`}
                            className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors duration-200"
                            onClick={handleClose}
                          >
                            <div className="flex items-center justify-between">
                              <span>{story.title}</span>
                              {story.category && (
                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                  {story.category}
                                </span>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Templates Results */}
                {results?.templates && results.templates.length > 0 && (
                  <motion.div variants={resultItemVariants} initial="hidden" animate="visible">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Templates ({results.templates.length})
                    </h4>
                    <div className="space-y-1">
                      {results.templates.map((template) => (
                        <motion.div
                          key={template._id}
                          variants={resultItemVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Link
                            href={`/histoires/hero/${template._id}`}
                            className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors duration-200"
                            onClick={handleClose}
                          >
                            <div className="flex items-center justify-between">
                              <span>{template.title}</span>
                              {template.category && (
                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                  {template.category}
                                </span>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No Results */}
                {!results?.stories?.length && 
                 !results?.templates?.length && 
                 !results?.users?.length && (
                  <motion.div 
                    className="text-center py-8"
                    variants={resultItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <p className="text-sm text-muted-foreground">
                      Aucun résultat trouvé pour "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Essayez avec d'autres mots-clés
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {!hasSearched && !isSearching && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Commencez à taper pour rechercher des histoires et templates
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Appuyez sur Échap pour fermer
            </p>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setResults(null);
                  setHasSearched(false);
                }}
              >
                Effacer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;