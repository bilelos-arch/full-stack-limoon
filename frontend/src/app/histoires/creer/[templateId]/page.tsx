//frontend/src/app/histoires/creer/[templateId]/page.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { templatesApi, Template } from '@/lib/templatesApi';
import { histoireApi, Histoire } from '@/lib/histoireApi';
import { authApi } from '@/lib/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Sparkles, Download, BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import HistoireForm from '@/components/HistoireForm';
import HistoirePreview from '@/components/HistoirePreview';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export default function CreerHistoirePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const { user, isAuthenticated } = useAuth();
  const { generateHistoire, isLoading, error, clearError } = useHistoiresStore();

  const [template, setTemplate] = useState<Template | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHistoire, setGeneratedHistoire] = useState<Histoire | null>(null);
  const [finalVariables, setFinalVariables] = useState<Record<string, string>>({});
  const [isGeneratingFinalPreview, setIsGeneratingFinalPreview] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    console.log('useEffect triggered - isAuthenticated:', isAuthenticated, 'templateId:', templateId, 'user:', user);
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (templateId) {
      // Basic validation: check if templateId looks like a valid MongoDB ObjectId (24 hex chars)
      const isValidObjectId = /^[a-f\d]{24}$/i.test(templateId);
      if (!isValidObjectId) {
        console.error('Invalid templateId format:', templateId);
        // Could redirect to error page or show error message
        return;
      }
      loadTemplate();
      loadUserProfile();
    }
  }, [isAuthenticated, templateId, router]);


  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist').then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      });
    }
  }, []);

  // Load PDF when generatedHistoire is available (for download functionality)
  useEffect(() => {
    if (generatedHistoire?.generatedPdfUrl) {
      loadPDF(generatedHistoire.generatedPdfUrl);
    }
  }, [generatedHistoire?.generatedPdfUrl]);

  // Render PDF page when pdfDoc or page/scale changes (for download functionality)
  useEffect(() => {
    if (pdfDoc && pdfCanvasRef.current) {
      renderPdfPage(pdfCurrentPage);
    }
  }, [pdfDoc, pdfCurrentPage, pdfScale]);

  const loadTemplate = async () => {
    try {
      console.log('Loading template with ID:', templateId);
      const templateData = await templatesApi.getTemplate(templateId);
      console.log('Template loaded successfully:', templateData);
      setTemplate(templateData);
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error);
      console.error('Template ID that failed:', templateId);
    }
  };

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile for avatar retrieval');
      const profile = await authApi.getProfile();
      console.log('User profile loaded:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
    }
  };

  const handlePreview = useCallback(async (variables: Record<string, string>) => {
    console.log('[DEBUG] handlePreview called with variables:', variables);
    console.log('[DEBUG] template:', template);
    console.log('[DEBUG] user:', user);
    console.log('[DEBUG] user?._id:', user?._id);
    console.log('[DEBUG] templateId:', templateId);
    console.log('[DEBUG] showPreview before:', showPreview);
    console.log('[DEBUG] userProfile:', userProfile);

    if (!template || !user?._id) {
      console.error('[DEBUG] Missing template or user:', { template: !!template, userId: user?._id });
      return;
    }

    setIsGeneratingPreview(true);
    try {
      console.log('[DEBUG] Calling generateHistoire for preview...');

      // Include avatar from user profile if available
      const variablesWithAvatar = { ...variables };
      if (userProfile?.childAvatar && !variablesWithAvatar.avatar) {
        variablesWithAvatar.avatar = userProfile.childAvatar;
        console.log('[DEBUG] Included child avatar in preview variables:', userProfile.childAvatar);
      }

      // Generate the full histoire instead of just preview
      const histoire = await generateHistoire({
        templateId: templateId,
        variables: variablesWithAvatar,
      });

      console.log('[DEBUG] generateHistoire returned:', histoire);
      console.log('[DEBUG] histoire type:', typeof histoire);
      console.log('[DEBUG] histoire.previewUrls:', histoire?.previewUrls);
      console.log('[DEBUG] histoire.previewUrls length:', histoire?.previewUrls?.length);

      if (histoire) {
        console.log('[DEBUG] Setting generated histoire for preview');
        setGeneratedHistoire(histoire);
        setFinalVariables(variablesWithAvatar);

        // Use the preview images from the generated histoire
        const previewUrls = histoire.previewUrls || [];
        console.log('[DEBUG] Setting previewImages with:', previewUrls);
        console.log('[DEBUG] Preview URLs are strings:', previewUrls.every(url => typeof url === 'string'));
        setPreviewImages(previewUrls);

        // Show preview immediately after generation
        console.log('[DEBUG] Setting showPreview to true');
        setShowPreview(true);
        console.log('[DEBUG] showPreview after setting:', true);
      } else {
        console.error('[DEBUG] generateHistoire returned null or undefined');
        setPreviewImages([]);
        console.log('[DEBUG] Setting showPreview to false due to null histoire');
        setShowPreview(false);
      }
    } catch (error) {
      console.error('[DEBUG] Erreur lors de la génération de l\'histoire:', error);
      console.error('[DEBUG] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      setPreviewImages([]);
      console.log('[DEBUG] Setting showPreview to false due to error');
      setShowPreview(false);
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [template, user?._id, templateId, generateHistoire, showPreview, userProfile]);

  const handleGenerate = async (variables: Record<string, string>) => {
    console.log('[DEBUG] handleGenerate called with variables:', variables);
    console.log('[DEBUG] template:', template);
    console.log('[DEBUG] user:', user);
    console.log('[DEBUG] user?._id:', user?._id);
    console.log('[DEBUG] isAuthenticated:', isAuthenticated);
    console.log('[DEBUG] userProfile:', userProfile);

    if (!template || !user?._id) {
      console.error('[DEBUG] Missing template or user:', { template: !!template, userId: user?._id, user: user, isAuthenticated });
      console.error('[DEBUG] Full user object:', JSON.stringify(user, null, 2));
      return;
    }

    setIsGenerating(true);
    try {
      // Include avatar from user profile if available
      const variablesWithAvatar = { ...variables };
      if (userProfile?.childAvatar && !variablesWithAvatar.avatar) {
        variablesWithAvatar.avatar = userProfile.childAvatar;
        console.log('[DEBUG] Included child avatar in final PDF variables:', userProfile.childAvatar);
      }

      console.log('[DEBUG] Calling generateHistoire with:', {
        templateId: templateId,
        variables: variablesWithAvatar,
      });

      console.log('[DEBUG] About to call generateHistoire from store...');
      const histoire = await generateHistoire({
        templateId: templateId,
        variables: variablesWithAvatar,
      });

      console.log('[DEBUG] generateHistoire returned:', histoire);
      console.log('[DEBUG] histoire type:', typeof histoire);
      console.log('[DEBUG] histoire is null:', histoire === null);
      console.log('[DEBUG] histoire is undefined:', histoire === undefined);

      if (histoire) {
        console.log('[DEBUG] Histoire object received, checking structure...');
        console.log('[DEBUG] histoire.previewUrls:', histoire?.previewUrls);
        console.log('[DEBUG] histoire.previewUrls length:', histoire?.previewUrls?.length);
        console.log('[DEBUG] histoire.previewUrls type:', typeof histoire?.previewUrls);
        console.log('[DEBUG] histoire.generatedPdfUrl:', histoire?.generatedPdfUrl);
        console.log('[DEBUG] histoire.pdfUrl:', histoire?.pdfUrl);
        console.log('[DEBUG] histoire._id:', histoire?._id);
        console.log('[DEBUG] Full histoire object:', JSON.stringify(histoire, null, 2));

        // Handle different response formats from backend
        let actualHistoire = histoire;
        // Note: Removed nested response handling as Histoire type doesn't have success/histoire properties

        console.log('[DEBUG] Setting generated histoire for preview');
        setGeneratedHistoire(actualHistoire);
        setFinalVariables(variablesWithAvatar);

        // Utiliser les images de preview générées lors de la création de l'histoire
        const previewUrls = actualHistoire.previewUrls || [];
        console.log('[DEBUG] Setting previewImages with:', previewUrls);
        console.log('[DEBUG] Preview URLs are strings:', previewUrls.every(url => typeof url === 'string'));
        setPreviewImages(previewUrls);

        // Show preview immediately after generation
        console.log('[DEBUG] Setting showPreview to true');
        setShowPreview(true);

        // Stay on the page instead of navigating
      } else {
        console.error('[DEBUG] generateHistoire returned null or undefined');
        console.error('[DEBUG] This means the API call failed or returned an invalid response');
        setPreviewImages([]);
        console.log('[DEBUG] Setting showPreview to false due to null histoire');
        setShowPreview(false);
      }
    } catch (error) {
      console.error('[DEBUG] Erreur lors de la génération:', error);
      console.error('[DEBUG] Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      setPreviewImages([]);
      console.log('[DEBUG] Setting showPreview to false due to error');
      setShowPreview(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadPDF = async (pdfUrl: string) => {
    setIsPdfLoading(true);
    try {
      console.log('Loading PDF from URL:', pdfUrl);
      const { getDocument } = await import('pdfjs-dist');
      const loadingTask = getDocument({ url: pdfUrl });
      console.log('PDF loading task created');
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      setPdfDoc(pdf);
      setPdfNumPages(pdf.numPages);
      setPdfCurrentPage(1);
      setPdfScale(1.0);
    } catch (error) {
      console.error('Error loading PDF:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const renderPdfPage = async (pageNum: number) => {
    if (!pdfDoc || !pdfCanvasRef.current) return;

    try {
      console.log('Rendering PDF page:', pageNum, 'scale:', pdfScale);
      const page = await pdfDoc.getPage(pageNum);
      console.log('PDF page loaded:', pageNum);
      const viewport = page.getViewport({ scale: pdfScale });
      console.log('Viewport dimensions:', viewport.width, 'x', viewport.height);

      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Could not get 2D context from canvas');
        return;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      console.log('Starting PDF render...');
      await page.render(renderContext).promise;
      console.log('PDF page rendered successfully');
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
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

  const handleDownload = async () => {
    console.log('handleDownload called');
    console.log('generatedHistoire:', generatedHistoire);
    console.log('generatedPdfUrl:', generatedHistoire?.generatedPdfUrl);

    if (!generatedHistoire?.generatedPdfUrl) {
      console.log('No generatedPdfUrl, returning');
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Build the full URL for the PDF file
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      let pdfPath = generatedHistoire.generatedPdfUrl;

      // Convert Cloudinary URL to local URL if needed
      if (pdfPath.includes('res.cloudinary.com')) {
        // Extract filename from Cloudinary URL
        const urlParts = pdfPath.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        pdfPath = `pdfs/${filename}.pdf`;
      }

      // Normalize pdfPath to be relative to /uploads/
      if (pdfPath.startsWith('/uploads/')) {
        pdfPath = pdfPath.substring(8);
      } else if (pdfPath.startsWith('/')) {
        pdfPath = pdfPath.substring(1);
      }

      const fullPdfUrl = `${apiBaseUrl}/uploads/${pdfPath}`;
      console.log('Fetching PDF from:', fullPdfUrl);

      const response = await fetch(fullPdfUrl);
      console.log('Response status:', response.status, 'ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob received, size:', blob.size, 'type:', blob.type);

      // Validate that it's actually a PDF
      if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
        console.error('Downloaded file is not a PDF, type:', blob.type);
        // Check first few bytes to see if it's actually a PDF
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer.slice(0, 4));
        const header = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('File header (first 4 bytes):', header);
        if (header !== '25504446') { // PDF magic number %PDF
          throw new Error('Le fichier téléchargé n\'est pas un PDF valide');
        }
      }

      const url = window.URL.createObjectURL(blob);
      console.log('Blob URL created:', url);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${template?.title || 'Histoire personnalisée'}.pdf`;
      console.log('Download filename:', link.download);

      document.body.appendChild(link);
      console.log('Link appended to body, clicking...');
      link.click();
      console.log('Link clicked, removing from body');
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('Blob URL revoked');
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      setDownloadError(`Erreur lors du téléchargement du PDF: ${(error as Error).message}`);
    } finally {
      setIsDownloading(false);
      console.log('Download process finished');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => showPreview ? setShowPreview(false) : router.back()}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {showPreview ? 'Aperçu de votre histoire' : 'Personnaliser l\'histoire'}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">{template.title}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/histoires/hero/${user?._id}`}>
                <User className="h-4 w-4 mr-2" />
                Créer un avatar
              </Link>
            </Button>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" size="sm" onClick={clearError}>
                Fermer
              </Button>
            </Alert>
          )}

          {!showPreview ? (
            /* Form Section */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <HistoireForm
                templateId={templateId}
                onShowPreview={handlePreview}
              />
            </motion.div>
          ) : (
            /* Preview Section - Full Page */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <HistoirePreview
                previewImages={previewImages}
                isLoading={isGeneratingPreview}
                onRetry={() => handlePreview(finalVariables)}
                pdfUrl={generatedHistoire?.generatedPdfUrl}
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                {generatedHistoire?.generatedPdfUrl && (
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 sm:flex-none"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Téléchargement...' : 'Télécharger l\'histoire'}
                  </Button>
                )}

                {downloadError && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertDescription>{downloadError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => {
                    alert('Fonctionnalité de commande bientôt disponible. Redirection vers la boutique...');
                    router.push('/book-store');
                  }}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Commander le livre
                </Button>

                <Button
                  onClick={() => router.push('/histoires')}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Retour à mes histoires
                </Button>
              </div>
            </motion.div>
          )}

          {/* Preview Modal */}
          <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Aperçu de l'histoire</DialogTitle>
              </DialogHeader>
              <HistoirePreview
                previewImages={previewImages}
                isLoading={isGeneratingPreview}
                onRetry={() => handlePreview(finalVariables)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}