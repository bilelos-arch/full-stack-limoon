'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Note: Collapsible component not available, using simple state-based expansion
import { useHistoiresStore } from '@/stores/histoiresStore';

interface HistoireFiltersProps {
  className?: string;
}

const CATEGORIES = [
  'Aventure', 'Conte de fées', 'Animaux', 'Famille', 'Amitié',
  'Nature', 'Espace', 'Pirates', 'Princesses', 'Dinosaures'
];

const AGE_RANGES = ['3-5 ans', '6-8 ans', '9-12 ans'];

const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Allemand'];

export default function HistoireFilters({ className }: HistoireFiltersProps) {
  const {
    filters,
    sortBy,
    searchQuery,
    setFilters,
    setSortBy,
    setSearchQuery,
    resetFilters,
    filteredHistoires,
    filteredTemplates
  } = useHistoiresStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [localSearchQuery, setSearchQuery]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category ? filters.category.split(',') : [];
    let newCategories: string[];

    if (checked) {
      newCategories = [...currentCategories, category];
    } else {
      newCategories = currentCategories.filter(c => c !== category);
    }

    setFilters({
      category: newCategories.length > 0 ? newCategories.join(',') : undefined
    });
  };

  const handleAgeRangeChange = (ageRange: string) => {
    setFilters({ ageRange: ageRange === 'all' ? undefined : ageRange });
  };

  const handleLanguageChange = (language: string) => {
    setFilters({ language: language === 'all' ? undefined : language });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.ageRange) count++;
    if (filters.language) count++;
    if (searchQuery) count++;
    return count;
  };

  const getSelectedCategories = () => {
    return filters.category ? filters.category.split(',') : [];
  };

  const removeFilter = (filterType: keyof typeof filters) => {
    setFilters({ [filterType]: undefined });
  };

  const clearAllFilters = () => {
    resetFilters();
    setLocalSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>

            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()} actif{getActiveFiltersCount() > 1 ? 's' : ''}
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {isExpanded ? 'Masquer' : 'Afficher'} les filtres
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, description..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          <AnimatePresence>
            {getActiveFiltersCount() > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Recherche: {searchQuery}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setLocalSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Catégorie: {filters.category}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('category')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.ageRange && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Âge: {filters.ageRange}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('ageRange')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.language && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Langue: {filters.language}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFilter('language')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-6 px-2"
                >
                  Tout effacer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Trier par:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date de création</SelectItem>
                <SelectItem value="popularite">Popularité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Catégories</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={getSelectedCategories().includes(category)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(category, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tranche d'âge</Label>
                  <Select
                    value={filters.ageRange || 'all'}
                    onValueChange={handleAgeRangeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les tranches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les tranches</SelectItem>
                      {AGE_RANGES.map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Langue</Label>
                  <Select
                    value={filters.language || 'all'}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les langues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les langues</SelectItem>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground pt-2 border-t">
            {filteredHistoires().length} histoire{filteredHistoires().length > 1 ? 's' : ''} trouvée{filteredHistoires().length > 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}