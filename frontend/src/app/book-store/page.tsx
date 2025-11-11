'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, BookOpen, Sparkles, X, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { templatesApi, Template } from '@/lib/templatesApi';
import { histoireApi } from '@/lib/histoireApi';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useQuery } from '@tanstack/react-query';
import { StoryCard } from '@/components/StoryCard';
import { useAuth } from '@/hooks/useAuth';

const PDFPreviewModal = dynamic(() => import('@/components/PDFPreviewModal'), {
  ssr: false,
});

// Server-side data fetching
async function getInitialTemplates(): Promise<Template[]> {
  try {
    const data = await templatesApi.getTemplates({ isPublished: 'true' });
    return data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
}

// Client component for interactive features
function StoryPageClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  
  // UI states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite scroll state
  const [displayedTemplates, setDisplayedTemplates] = useState<Template[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // SWR for templates with stale-while-revalidate
  const { data: templates = initialTemplates, error: swrError, mutate } = useSWR(
    'templates',
    () => templatesApi.getTemplates({ isPublished: 'true' }),
    {
      fallbackData: initialTemplates,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Debug logs for templates data
  useEffect(() => {
    console.log('Templates received from API:', templates);
    console.log('Number of templates:', templates.length);
    templates.forEach((template, index) => {
      console.log(`Template ${index + 1}: ${template.title} - _id = ${template._id}`);
      console.log(`  _id type: ${typeof template._id}`);
      console.log(`  _id is null: ${template._id === null}`);
      console.log(`  _id is undefined: ${template._id === undefined}`);
      console.log(`  _id is empty string: ${template._id === ''}`);
      console.log(`  _id matches ObjectId regex: ${template._id ? /^[a-f\d]{24}$/i.test(template._id) : false}`);
    });
  }, [templates]);

  // React Query for search suggestions
  const { data: searchResults, refetch: refetchSearch, isFetching: isSearching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => templatesApi.searchTemplates(searchQuery, 5),
    enabled: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  // Extract unique filter options
  const categories = useMemo(() => 
    [...new Set(templates.map(t => t.category))].filter(Boolean).sort(),
    [templates]
  );

  const ageRanges = useMemo(() => 
    [...new Set(templates.map(t => t.ageRange))].filter(Boolean).sort(),
    [templates]
  );

  const languages = useMemo(() => 
    [...new Set(templates.map(t => t.language))].filter(Boolean).sort(),
    [templates]
  );

  const genderMapping: { [key: string]: string } = {
    'Fille': 'girl',
    'Garçon': 'boy',
    'Unisexe': 'unisex'
  };

  // Debounced search
  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setShowSuggestions(false);
      return;
    }

    try {
      await refetchSearch();
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Erreur de recherche');
    }
  }, [refetchSearch]);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (template: Template) => {
    setSearchQuery(template.title);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    
    // Scroll to template
    setTimeout(() => {
      const element = document.getElementById(`template-${template._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Modal handlers
  const handlePreviewClick = async (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);

    // Generate preview PDF with default variables
    try {
      const result = await histoireApi.generatePreview(template._id, {});
      setSelectedTemplate({ ...template, pdfUrl: result.pdfUrl });
      console.log('Preview generated:', result);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Erreur lors de la génération de l\'aperçu');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleCustomize = (template: Template) => {
    if (user) {
      router.push(`/histoires/creer/${template._id}`);
    } else {
      // Handle case when user is not connected
      toast.error('Vous devez être connecté pour personnaliser une histoire');
    }
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = !searchQuery ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(template.category);
      
      const matchesAges = selectedAges.length === 0 || 
        selectedAges.includes(template.ageRange);
      
      const templateGender = genderMapping[template.gender as keyof typeof genderMapping] || template.gender;
      const matchesGenders = selectedGenders.length === 0 || 
        selectedGenders.includes(templateGender);
      
      const matchesLanguages = selectedLanguages.length === 0 || 
        selectedLanguages.includes(template.language);

      return matchesSearch && matchesCategories && matchesAges && matchesGenders && matchesLanguages;
    });
  }, [templates, searchQuery, selectedCategories, selectedAges, selectedGenders, selectedLanguages]);

  // Sort templates
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return b.isRecent ? 1 : -1;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filteredTemplates, sortBy]);

  // Update displayed templates when filters change
  useEffect(() => {
    setDisplayedTemplates(sortedTemplates.slice(0, 12));
    setHasMore(sortedTemplates.length > 12);
  }, [sortedTemplates]);

  // Infinite scroll
  const loadMoreTemplates = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentLength = displayedTemplates.length;
    const nextBatch = sortedTemplates.slice(currentLength, currentLength + 12);

    setDisplayedTemplates(prev => [...prev, ...nextBatch]);
    setHasMore(currentLength + nextBatch.length < sortedTemplates.length);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, displayedTemplates.length, sortedTemplates]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreTemplates();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreTemplates]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedAges([]);
    setSelectedGenders([]);
    setSelectedLanguages([]);
    setSortBy('popular');
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || 
    selectedAges.length > 0 || selectedGenders.length > 0 || selectedLanguages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header with Search */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4 lg:mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Rechercher une histoire..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-10 pr-10"
                aria-label="Rechercher une histoire"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && isSearchFocused && searchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden"
                  >
                    {searchResults.map((template) => (
                      <button
                        key={template._id}
                        onClick={() => handleSuggestionSelect(template)}
                        className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-start gap-3"
                      >
                        <Search className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{template.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{template.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-shrink-0 w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full mb-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              {isSidebarOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
          </div>

          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-80 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-8 bg-card border rounded-lg p-4 lg:p-6 space-y-4 lg:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <Badge variant="secondary">{sortedTemplates.length}</Badge>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label htmlFor="sort-select" className="text-sm font-medium">
                  Trier par
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Plus populaires</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="title">Ordre alphabétique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Catégories</Label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            setSelectedCategories(
                              checked
                                ? [...selectedCategories, category]
                                : selectedCategories.filter(c => c !== category)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age Range */}
              {ageRanges.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tranche d'âge</Label>
                  <div className="space-y-2">
                    {ageRanges.map((age) => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${age}`}
                          checked={selectedAges.includes(age)}
                          onCheckedChange={(checked) => {
                            setSelectedAges(
                              checked
                                ? [...selectedAges, age]
                                : selectedAges.filter(a => a !== age)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`age-${age}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {age}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Genre</Label>
                <div className="space-y-2">
                  {Object.entries(genderMapping).map(([french, english]) => (
                    <div key={english} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gender-${english}`}
                        checked={selectedGenders.includes(english)}
                        onCheckedChange={(checked) => {
                          setSelectedGenders(
                            checked
                              ? [...selectedGenders, english]
                              : selectedGenders.filter(g => g !== english)
                          );
                        }}
                      />
                      <Label
                        htmlFor={`gender-${english}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {french}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {languages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Langue</Label>
                  <div className="space-y-2">
                    {languages.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={`language-${language}`}
                          checked={selectedLanguages.includes(language)}
                          onCheckedChange={(checked) => {
                            setSelectedLanguages(
                              checked
                                ? [...selectedLanguages, language]
                                : selectedLanguages.filter(l => l !== language)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`language-${language}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results */}
            {displayedTemplates.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {displayedTemplates.map((template) => (
                    <StoryCard
                      key={template._id}
                      template={template}
                      onPreview={handlePreviewClick}
                      onCustomize={handleCustomize}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Chargement...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12 lg:py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 relative inline-block"
                >
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-10 h-10 lg:w-12 lg:h-12 text-primary" />
                  </div>
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
                </motion.div>

                <h3 className="text-xl lg:text-2xl font-bold mb-3">
                  {hasActiveFilters ? 'Aucun résultat trouvé' : 'Aucune histoire disponible'}
                </h3>

                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm lg:text-base">
                  {hasActiveFilters
                    ? 'Essayez de modifier vos filtres pour découvrir plus d\'histoires.'
                    : 'Les histoires seront bientôt disponibles. Revenez plus tard !'
                  }
                </p>

                {hasActiveFilters && (
                  <Button onClick={resetFilters}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}

            {/* Error State */}
            {swrError && (
              <div className="text-center py-12 lg:py-16">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 lg:w-12 lg:h-12 text-red-500" />
                </div>

                <h3 className="text-xl lg:text-2xl font-bold mb-3">Oups ! Une erreur est survenue</h3>
                <p className="text-muted-foreground mb-6 text-sm lg:text-base">
                  Impossible de charger les histoires
                </p>
                
                <Button onClick={() => mutate()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        template={selectedTemplate}
        onCustomize={handleCustomize}
        pdfUrl={selectedTemplate?.pdfUrl ? (selectedTemplate.pdfUrl.includes('res.cloudinary.com')
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedTemplate.pdfUrl.split('/').pop()?.split('.')[0]}.pdf`
          : selectedTemplate.pdfUrl.startsWith('http')
          ? selectedTemplate.pdfUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${selectedTemplate.pdfUrl}`) : undefined}
      />
    </div>
  );
}

// Server Component
export default function StoryPage() {
  return <StoryPageClient initialTemplates={[]} />;
}
