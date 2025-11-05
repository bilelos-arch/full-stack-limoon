import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { histoireApi, Histoire, GenerateHistoireDto } from '@/lib/histoireApi';
import { templatesApi, Template } from '@/lib/templatesApi';

interface HistoiresState {
  histoires: Histoire[];
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    ageRange?: string;
    language?: string;
  };
  sortBy: 'date' | 'popularite';
  searchQuery: string;

  // Actions
  fetchUserHistoires: (userId: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  generateHistoire: (data: GenerateHistoireDto) => Promise<Histoire | null>;
  setFilters: (filters: Partial<HistoiresState['filters']>) => void;
  setSortBy: (sortBy: HistoiresState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  resetFilters: () => void;

  // Computed
  filteredHistoires: () => Histoire[];
  filteredTemplates: () => Template[];
}

export const useHistoiresStore = create<HistoiresState>()(
  persist(
    (set, get) => ({
      histoires: [],
      templates: [],
      isLoading: false,
      error: null,
      filters: {},
      sortBy: 'date',
      searchQuery: '',

      fetchUserHistoires: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const histoires = await histoireApi.getUserHistoires(userId);
          set({ histoires, isLoading: false });
        } catch (error) {
          console.error('Erreur lors de la récupération des histoires:', error);
          set({
            error: 'Erreur lors de la récupération des histoires',
            isLoading: false
          });
        }
      },

      fetchTemplates: async () => {
        try {
          set({ isLoading: true, error: null });
          const templates = await templatesApi.getAllTemplates();
          set({ templates, isLoading: false });
        } catch (error) {
          console.error('Erreur lors de la récupération des templates:', error);
          set({
            error: 'Erreur lors de la récupération des templates',
            isLoading: false
          });
        }
      },

      generateHistoire: async (data: GenerateHistoireDto) => {
        try {
          set({ isLoading: true, error: null });
          const response = await histoireApi.generateHistoire(data);

          // Utiliser directement la réponse du backend qui contient maintenant l'objet Histoire complet
          const newHistoire: Histoire = {
            ...response,
            previewUrls: response.previewUrls || [],
            generatedPdfUrl: response.generatedPdfUrl || response.pdfUrl,
          };

          console.log('Store: newHistoire.generatedPdfUrl:', newHistoire.generatedPdfUrl);
          console.log('Store: response.generatedPdfUrl:', response.generatedPdfUrl);
          console.log('Store: response.pdfUrl:', response.pdfUrl);

          set({ isLoading: false });

          return newHistoire;
        } catch (error) {
          console.error('Erreur lors de la génération de l\'histoire:', error);
          set({
            error: 'Erreur lors de la génération de l\'histoire',
            isLoading: false
          });
          return null;
        }
      },

      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      setSortBy: (sortBy) => {
        set({ sortBy });
      },

      setSearchQuery: (searchQuery) => {
        set({ searchQuery });
      },

      clearError: () => {
        set({ error: null });
      },

      resetFilters: () => {
        set({ filters: {}, searchQuery: '', sortBy: 'date' });
      },

      filteredHistoires: () => {
        const { histoires, filters, sortBy, searchQuery } = get();

        let filtered = histoires.filter(histoire => {
          // Recherche par titre ou description du template associé
          if (searchQuery) {
            const template = get().templates.find(t => t._id === histoire.templateId);
            if (template) {
              const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                   template.description.toLowerCase().includes(searchQuery.toLowerCase());
              if (!matchesSearch) return false;
            }
          }

          // Filtres par catégorie, âge, langue via template
          if (filters.category || filters.ageRange || filters.language) {
            const template = get().templates.find(t => t._id === histoire.templateId);
            if (template) {
              if (filters.category && template.category !== filters.category) return false;
              if (filters.ageRange && template.ageRange !== filters.ageRange) return false;
              if (filters.language && template.language !== filters.language) return false;
            }
          }

          return true;
        });

        // Tri
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'popularite':
              // Pour l'instant, tri par date si pas de métriques de popularité
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
              return 0;
          }
        });

        return filtered;
      },

      filteredTemplates: () => {
        const { templates, filters, searchQuery } = get();

        return templates.filter(template => {
          // Recherche
          if (searchQuery) {
            const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 template.description.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
          }

          // Filtres
          if (filters.category && template.category !== filters.category) return false;
          if (filters.ageRange && template.ageRange !== filters.ageRange) return false;
          if (filters.language && template.language !== filters.language) return false;

          return true;
        });
      },
    }),
    {
      name: 'histoires-storage',
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        searchQuery: state.searchQuery,
      }),
    }
  )
);