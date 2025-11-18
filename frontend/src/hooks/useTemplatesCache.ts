'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface TemplatesCache {
  templates: CacheEntry<Template[]>;
  search: Map<string, CacheEntry<Template[]>>;
}

interface Template {
  _id: string;
  title: string;
  category?: string;
  previewImage?: string;
}

/**
 * Hook pour gérer le cache des templates et optimiser les performances
 */
export const useTemplatesCache = () => {
  const cache = useRef<Map<string, CacheEntry<any>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getCachedData = useCallback((key: string) => {
    const cached = cache.current.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: any) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const fetchTemplates = useCallback(async (limit = 20, force = false) => {
    const cacheKey = `templates-${limit}`;
    const cached = getCachedData(cacheKey);
    
    if (!force && cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      const templates = result.data || [];
      
      setCachedData(cacheKey, templates);
      return templates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      // Retourner les données en cache même si expirées en cas d'erreur
      const fallbackCached = cache.current.get(cacheKey);
      if (fallbackCached) {
        return fallbackCached.data;
      }
      
      // Fallback avec des données statiques
      const fallbackTemplates = [
        { _id: '1', title: 'L\'Aventurier des Étoiles', category: 'Aventure' },
        { _id: '2', title: 'Le Royaume des Dragons', category: 'Fantasy' },
        { _id: '3', title: 'La Magie du Noël', category: 'Vacances' },
        { _id: '4', title: 'Le Pirate Courageux', category: 'Aventure' },
        { _id: '5', title: 'La Princesse et le Royaume', category: 'Princesse' }
      ];
      
      return fallbackTemplates;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedData, setCachedData]);

  const searchTemplates = useCallback(async (query: string, limit = 10) => {
    if (!query.trim()) {
      return [];
    }

    const searchKey = `search-${query.toLowerCase()}-${limit}`;
    const cached = getCachedData(searchKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=templates&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      const templates = result.templates || result.data || [];
      
      setCachedData(searchKey, templates);
      return templates;
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      // Retourner des résultats basiques en cas d'erreur
      return [];
    }
  }, [getCachedData, setCachedData]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cache.current.size;
  }, []);

  const getCacheInfo = useCallback(() => {
    const entries = Array.from(cache.current.entries());
    const now = Date.now();
    
    return entries.map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      isExpired: now - entry.timestamp >= CACHE_DURATION
    }));
  }, []);

  return {
    fetchTemplates,
    searchTemplates,
    getCachedData,
    setCachedData,
    clearCache,
    getCacheSize,
    getCacheInfo,
    isLoading,
    error,
    CACHE_DURATION
  };
};

export default useTemplatesCache;