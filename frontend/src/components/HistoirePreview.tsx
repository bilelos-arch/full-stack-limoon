'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoirePreviewProps {
  previewImages?: string[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  pdfUrl?: string;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export default function HistoirePreview({
  previewImages = [],
  isLoading = false,
  error = null,
  onRetry,
  className,
  pdfUrl,
  onDownload,
  isDownloading = false
}: HistoirePreviewProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    console.log('[DEBUG] HistoirePreview useEffect triggered');
    console.log('[DEBUG] previewImages:', previewImages);
    console.log('[DEBUG] previewImages length:', previewImages?.length);
    console.log('[DEBUG] isLoading:', isLoading);
    console.log('[DEBUG] error:', error);
    setCurrentPage(0);
  }, [previewImages]);

  const handleImageLoad = useCallback((index: number) => {
    console.log(`[DEBUG] Image loaded successfully for page ${index + 1}`);
    console.log(`[DEBUG] Image quality check: object-contain applied, lazy loading active`);
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index: number) => {
    console.error(`[DEBUG] Image failed to load for page ${index + 1}`);
    console.error(`[DEBUG] Image URL:`, previewImages[index]);
    setImageErrors(prev => new Set(prev).add(index));
  }, [previewImages]);

  const displayedImages = previewImages;

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(displayedImages.length - 1, prev + 1));
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="bg-white hover:bg-red-50 border-red-200">
                Réessayer
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Génération de l'histoire...</p>
          <p className="text-xs text-slate-400 mt-2">Cela peut prendre quelques instants</p>
        </div>
      </div>
    );
  }

  if (!previewImages || previewImages.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center text-slate-400">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-slate-500 font-medium">Aucun aperçu disponible</p>
          <p className="text-sm mt-1">Remplissez le formulaire pour générer l'histoire</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full flex flex-col ${className || ''}`}
    >
      {/* Navigation */}
      {displayedImages.length > 1 && (
        <div className="flex items-center justify-between mb-4 px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Page {currentPage + 1} / {displayedImages.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === displayedImages.length - 1}
            className="text-slate-500 hover:text-slate-900"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Current Preview Image */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-50/50 overflow-hidden">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex items-center justify-center p-4"
        >
          {!loadedImages.has(currentPage) && !imageErrors.has(currentPage) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0055FF]"></div>
            </div>
          )}

          {imageErrors.has(currentPage) ? (
            <div className="text-center text-red-400">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Erreur de chargement</p>
            </div>
          ) : (
            <img
              src={displayedImages[currentPage]}
              alt={`Aperçu ${currentPage + 1}`}
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
              loading="lazy"
              onLoad={() => handleImageLoad(currentPage)}
              onError={() => handleImageError(currentPage)}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}