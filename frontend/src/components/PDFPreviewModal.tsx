'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template } from '@/lib/templatesApi';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  onCustomize: (template: Template) => void;
  pdfUrl?: string;
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  template,
  onCustomize,
  pdfUrl
}: PDFPreviewModalProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });
    }
  }, []);

  // Load PDF when template or pdfUrl changes
  useEffect(() => {
    if (template && isOpen) {
      if (pdfUrl) {
        loadPDF(pdfUrl);
      } else {
        loadPDF();
      }
    }
  }, [template, isOpen, pdfUrl]);

  // Render current page
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as NodeListOf<HTMLElement>;

          if (focusableElements.length === 0) return;

          const firstElement = firstFocusableRef.current || focusableElements[0];
          const lastElement = lastFocusableRef.current || focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      firstFocusableRef.current?.focus();

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const loadPDF = async (customPdfUrl?: string) => {
    if (!template) return;

    setIsLoading(true);
    try {
      const { getDocument } = await import('pdfjs-dist');
      const pdfUrl = customPdfUrl || `${API_BASE_URL}/uploads/${template.pdfPath}`;
      console.log('Loading PDF from URL:', pdfUrl);
      console.log('Template pdfPath:', template.pdfPath);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      const loadingTask = getDocument({url: pdfUrl});
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setScale(1.0);
    } catch (error) {
      console.error('Error loading PDF:', error);
      console.error('Failed URL:', customPdfUrl || `${API_BASE_URL}/uploads/${template.pdfPath}`);
      console.error('API_BASE_URL at error:', API_BASE_URL);
      console.error('template.pdfPath at error:', template.pdfPath);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCustomize = () => {
    if (template) {
      onCustomize(template);
      onClose();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/0 backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
          aria-describedby="pdf-modal-description"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative mx-auto mt-0 mb-0 bg-background rounded-none shadow-none overflow-hidden ${
              isFullscreen ? 'w-full h-full max-w-none max-h-none' : 'w-full max-w-4xl h-[80vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
              <div>
                <CardTitle id="pdf-modal-title" className="text-lg">
                  Aperçu: {template.title}
                </CardTitle>
                <p id="pdf-modal-description" className="text-sm text-muted-foreground">
                  Page {currentPage} sur {numPages}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  aria-label="Fermer l'aperçu"
                  ref={lastFocusableRef}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Controls */}
            <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                  aria-label="Page précédente"
                  ref={firstFocusableRef}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  {currentPage} / {numPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage >= numPages}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  aria-label="Zoom arrière"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                  aria-label="Zoom avant"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleCustomize}
                aria-label={`Personnaliser ${template.title}`}
              >
                Personnaliser
              </Button>
            </div>

            {/* PDF Viewer */}
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="flex justify-center items-center min-h-full p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Chargement du PDF...</span>
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    className="shadow-none border-none rounded-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                )}
              </div>
            </CardContent>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}