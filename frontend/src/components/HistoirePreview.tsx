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
    setCurrentPage(0);
  }, [previewImages]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  }, []);

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
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Réessayer
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full md:w-3/4 lg:w-3/4 xl:w-3/4 mx-auto ${className || ''}`}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Votre de l'histoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Génération de l'histoire...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!previewImages || previewImages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full md:w-3/4 lg:w-3/4 xl:w-3/4 mx-auto ${className || ''}`}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Génération de l'histoire
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <div className="w-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Remplissez le formulaire pour générér l'histoire</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full md:w-3/4 lg:w-3/4 xl:w-3/4 mx-auto ${className || ''}`}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Génération de l'histoire
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Navigation */}
          {displayedImages.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage + 1} sur {displayedImages.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === displayedImages.length - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Current Preview Image */}
          {displayedImages.length > 0 && (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group w-full"
            >
              <Card className="overflow-hidden w-full">
                <div className="relative w-full bg-white">
                  {!loadedImages.has(currentPage) && !imageErrors.has(currentPage) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {imageErrors.has(currentPage) ? (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center py-16">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                        <p>Erreur de chargement</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={displayedImages[currentPage]}
                      alt={`Aperçu ${currentPage + 1}`}
                      className="w-full h-auto object-contain"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        filter: 'contrast(1.1) brightness(1.05)'
                      }}
                      onLoad={() => handleImageLoad(currentPage)}
                      onError={() => handleImageError(currentPage)}
                    />
                  )}
                </div>
                <div className="p-3 bg-background/95 backdrop-blur-sm">
                  <p className="text-sm font-medium text-center">
                    Page {currentPage + 1}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Status */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {previewImages.length} page{previewImages.length > 1 ? 's' : ''} générée{previewImages.length > 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}