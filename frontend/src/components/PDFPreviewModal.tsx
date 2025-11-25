'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Download } from 'lucide-react';
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
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });
    }
  }, []);

  // Load PDF
  useEffect(() => {
    if (template && isOpen) {
      if (pdfUrl) {
        loadPDF(pdfUrl);
      } else {
        loadPDF();
      }
    }
  }, [template, isOpen, pdfUrl]);

  // Render page
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadPDF = async (customPdfUrl?: string) => {
    if (!template) return;

    setIsLoading(true);
    try {
      const { getDocument } = await import('pdfjs-dist');

      let url = customPdfUrl || `${API_BASE_URL?.replace(/\/$/, '')}/uploads/${template.pdfPath}`;

      const loadingTask = getDocument(url);
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas
    };

    await page.render(renderContext).promise;
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  return (
    <AnimatePresence>
      {isOpen && template && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-8 bg-white rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-slate-900 truncate">{template.title}</h2>
                <p className="text-sm text-slate-500 font-light truncate">{template.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-4 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto bg-slate-50 p-8 flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0055FF] mx-auto mb-4"></div>
                  <p className="text-slate-500 font-light">Chargement du PDF...</p>
                </div>
              ) : (
                <canvas ref={canvasRef} className="shadow-xl rounded-lg" />
              )}
            </div>

            {/* Controls */}
            <div className="border-t border-slate-100 p-6 bg-white">
              <div className="flex items-center justify-between gap-4">
                {/* Pagination */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600 font-light min-w-[100px] text-center">
                    Page {currentPage} / {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === numPages}
                    className="h-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="h-9"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600 font-light min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="h-9"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => {
                    onCustomize(template);
                    onClose();
                  }}
                  className="bg-[#0055FF] hover:bg-[#0044CC] text-white h-10 px-6"
                >
                  Personnaliser
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}