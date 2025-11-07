//frontend/src/app/histoires/preview/[histoireId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { histoireApi, Histoire } from '@/lib/histoireApi';
import { templatesApi, Template } from '@/lib/templatesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Edit, Share2, Heart, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';
import PDFPreviewModal from '@/components/PDFPreviewModal';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export default function PreviewHistoirePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();

  const [histoire, setHistoire] = useState<Histoire | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfGenerationFailed, setPdfGenerationFailed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  const histoireId = params.histoireId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (histoireId) {
      loadHistoire();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, histoireId, router]);

  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });
    }
  }, []);

  // Load PDF when generatedPdfUrl is available
  useEffect(() => {
    if (histoire?.generatedPdfUrl) {
      loadPDF(histoire.generatedPdfUrl);
    }
  }, [histoire?.generatedPdfUrl]);

  // Render PDF page when pdfDoc or page/scale changes
  useEffect(() => {
    if (pdfDoc && pdfCanvasRef.current) {
      renderPdfPage(pdfCurrentPage);
    }
  }, [pdfDoc, pdfCurrentPage, pdfScale]);

  const loadHistoire = async () => {
    try {
      console.log('loadHistoire: Starting to load histoire with ID:', histoireId);
      setIsLoading(true);
      setError(null);
      setPdfGenerationFailed(false);

      const histoireData = await histoireApi.getHistoire(histoireId);
      console.log('loadHistoire: Histoire data received:', histoireData);
      console.log('loadHistoire: generatedPdfUrl present:', !!histoireData.generatedPdfUrl);
      setHistoire(histoireData);

      // Load template data
      if (histoireData.templateId) {
        const templateId = typeof histoireData.templateId === 'string' ? histoireData.templateId : (histoireData.templateId as { _id: string })._id;
        console.log('loadHistoire: Loading template with ID:', templateId);
        const templateData = await templatesApi.getTemplate(templateId);
        setTemplate(templateData);
      }

      // Set timeout for PDF generation (30 seconds)
      if (!histoireData.generatedPdfUrl) {
        timeoutRef.current = setTimeout(() => {
          console.log('PDF generation timeout reached');
          setPdfGenerationFailed(true);
        }, 30000);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'histoire:', error);
      setError('Erreur lors du chargement de l\'histoire');
      setPdfGenerationFailed(true);
    } finally {
      console.log('loadHistoire: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const loadPDF = async (pdfUrl: string) => {
    setIsPdfLoading(true);
    try {
      const { getDocument } = await import('pdfjs-dist');
      const loadingTask = getDocument({ url: pdfUrl });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setPdfNumPages(pdf.numPages);
      setPdfCurrentPage(1);
      setPdfScale(1.0);
    } catch (error) {
      console.error('Error loading PDF:', error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const renderPdfPage = async (pageNum: number) => {
    if (!pdfDoc || !pdfCanvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: pdfScale });

      const canvas = pdfCanvasRef.current;
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
      console.error('Error rendering PDF page:', error);
    }
  };

  const goToPrevPdfPage = () => {
    if (pdfCurrentPage > 1) {
      setPdfCurrentPage(pdfCurrentPage - 1);
    }
  };

  const goToNextPdfPage = () => {
    if (pdfCurrentPage < pdfNumPages) {
      setPdfCurrentPage(pdfCurrentPage + 1);
    }
  };

  const zoomInPdf = () => {
    setPdfScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOutPdf = () => {
    setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (histoire?.generatedPdfUrl) {
      const link = document.createElement('a');
      link.href = histoire.generatedPdfUrl;
      link.download = `${template?.title || 'Histoire personnalisée'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const nextImage = () => {
    if (histoire?.previewUrls && histoire.previewUrls.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === histoire.previewUrls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (histoire?.previewUrls && histoire.previewUrls.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? histoire.previewUrls!.length - 1 : prev - 1
      );
    }
  };

  const handleEdit = () => {
    if (histoire?.templateId) {
      const templateId = typeof histoire.templateId === 'string' ? histoire.templateId : (histoire.templateId as { _id: string })._id;
      router.push(`/histoires/creer/${templateId}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && histoire) {
      try {
        await navigator.share({
          title: template?.title || 'Histoire personnalisée',
          text: `Découvrez mon histoire personnalisée: ${template?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-64 w-full mb-6" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !histoire) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Aperçu de l'histoire</h1>
            </motion.div>

            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Histoire non trouvée'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Aperçu de l'histoire</h1>
                <p className="text-muted-foreground mt-1">{template?.title || 'Histoire personnalisée'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PDF Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative">
                    {histoire.previewUrls && histoire.previewUrls.length > 0 ? (
                      <div className="w-full h-full relative">
                        <img
                          src={`${API_BASE_URL}${histoire.previewUrls[currentImageIndex]}`}
                          alt={`Page ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                        {histoire.previewUrls.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                              {currentImageIndex + 1} / {histoire.previewUrls.length}
                            </div>
                          </>
                        )}
                      </div>
                    ) : histoire.generatedPdfUrl ? (
                      <div className="w-full h-full flex flex-col">
                        {/* PDF Controls */}
                        <div className="flex items-center justify-between p-4 bg-muted/50 border-b">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={goToPrevPdfPage}
                              disabled={pdfCurrentPage <= 1}
                              aria-label="Page précédente"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[80px] text-center">
                              {pdfCurrentPage} / {pdfNumPages}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={goToNextPdfPage}
                              disabled={pdfCurrentPage >= pdfNumPages}
                              aria-label="Page suivante"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={zoomOutPdf}
                              disabled={pdfScale <= 0.5}
                              aria-label="Zoom arrière"
                            >
                              <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[60px] text-center">
                              {Math.round(pdfScale * 100)}%
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={zoomInPdf}
                              disabled={pdfScale >= 3.0}
                              aria-label="Zoom avant"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-auto p-4">
                          <div className="flex justify-center items-center min-h-[400px]">
                            {isPdfLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2">Chargement du PDF...</span>
                              </div>
                            ) : (
                              <canvas
                                ref={pdfCanvasRef}
                                className="shadow-lg border rounded"
                                style={{ maxWidth: '100%', height: 'auto' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ) : pdfGenerationFailed ? (
                      <div className="text-center text-muted-foreground">
                        <div className="w-32 h-40 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center mb-4 mx-auto">
                          <div className="text-4xl text-red-500">⚠️</div>
                        </div>
                        <p className="text-sm font-medium text-red-600 mb-2">
                          Échec de la génération du PDF
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Une erreur s'est produite lors de la génération du PDF. Veuillez réessayer plus tard.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-32 h-40 bg-muted rounded-lg flex items-center justify-center mb-4 mx-auto">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <p>Génération du PDF en cours...</p>
                        <p className="text-xs mt-2">Debug: generatedPdfUrl is falsy</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {histoire.generatedPdfUrl && (
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le PDF
                    </Button>
                  )}

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier l'histoire
                  </Button>

                  <Button
                    onClick={() => router.push('/histoires')}
                    variant="outline"
                    className="w-full"
                  >
                    Retour à mes histoires
                  </Button>
                </CardContent>
              </Card>

              {/* Story Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Template</p>
                    <p className="text-sm">{template?.title || 'Template personnalisé'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Créée le</p>
                    <p className="text-sm">
                      {new Date(histoire.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {template && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                        <p className="text-sm">{template.category}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tranche d'âge</p>
                        <p className="text-sm">{template.ageRange}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Langue</p>
                        <p className="text-sm">{template.language}</p>
                      </div>
                    </>
                  )}

                  {/* Variables used */}
                  {Object.keys(histoire.variables).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Variables personnalisées</p>
                      <div className="space-y-1">
                        {Object.entries(histoire.variables).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {template && (
        <PDFPreviewModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          template={template}
          onCustomize={() => {
            setShowPDFModal(false);
            handleEdit();
          }}
        />
      )}
    </div>
  );
}