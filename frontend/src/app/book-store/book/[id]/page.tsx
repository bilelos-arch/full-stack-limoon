//frontend/src/app/book-store/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { templatesApi, Template } from '@/lib/templatesApi';
import PDFViewer from '@/components/PDFViewer';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Share2, Eye, Loader2 } from 'lucide-react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const templateId = params.id as string;

  // Logs de débogage pour diagnostiquer le problème avec params.id
  console.log('BookDetailPage - params:', params);
  console.log('BookDetailPage - params.id:', params.id);
  console.log('BookDetailPage - templateId:', templateId);
  console.log('BookDetailPage - params.id type:', typeof params.id);
  console.log('BookDetailPage - params.id is null:', params.id === null);
  console.log('BookDetailPage - params.id is undefined:', params.id === undefined);
  console.log('BookDetailPage - params.id is empty string:', params.id === '');
  console.log('BookDetailPage - URL actuelle:', typeof window !== 'undefined' ? window?.location?.href : 'SSR - pas de window');

  // Vérification de sécurité : si l'ID n'est pas défini, afficher une erreur
  if (!templateId || templateId === 'undefined') {
    console.error('Template ID is undefined or invalid:', templateId);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <Eye className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  ID du template manquant
                </h2>
                <p className="text-muted-foreground mb-6">
                  L'identifiant du template n'est pas valide. Veuillez revenir à la page précédente.
                </p>
                <Button onClick={() => router.back()}>
                  Retour
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // États
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);

  // Récupération du template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        console.log('BookDetailPage - Début de récupération du template avec ID:', templateId);
        setLoading(true);
        setError(null);
        const data = await templatesApi.getTemplate(templateId);
        console.log('BookDetailPage - Template récupéré avec succès:', data);
        setTemplate(data);
      } catch (err) {
        console.error('BookDetailPage - Erreur lors du chargement du template:', err);
        setError('Impossible de charger les informations du livre');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  // Génération du PDF de prévisualisation
  const generatePreview = async () => {
    if (!template) return;

    try {
      console.log('BookDetailPage - Début de génération du PDF de prévisualisation pour template:', template._id);
      console.log('BookDetailPage - template._id type:', typeof template._id);
      console.log('BookDetailPage - template._id is null:', template._id === null);
      console.log('BookDetailPage - template._id is undefined:', template._id === undefined);
      console.log('BookDetailPage - template._id is empty string:', template._id === '');
      console.log('BookDetailPage - template._id matches ObjectId regex:', template._id ? /^[a-f\d]{24}$/i.test(template._id) : false);
      setGeneratingPdf(true);
      const result = await templatesApi.generatePreview(template._id, {});
      console.log('BookDetailPage - PDF de prévisualisation généré avec succès:', result);
      console.log('BookDetailPage - PDF URL reçue:', result.pdfUrl);
      console.log('BookDetailPage - URL complète construite:', `${process.env.NEXT_PUBLIC_API_URL}${result.pdfUrl}`);
      setPdfUrl(result.pdfUrl);
    } catch (err) {
      console.error('BookDetailPage - Erreur lors de la génération du PDF:', err);
      toast.error('Erreur lors de la génération de l\'aperçu');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Génération automatique du PDF au chargement du template
  useEffect(() => {
    if (templateId && template && !pdfUrl && !generatingPdf) {
      generatePreview();
    }
  }, [templateId, template]);

  // Gestionnaires d'événements
  const handleCustomize = () => {
    if (user) {
      router.push(`/histoires/creer/${templateId}`);
    } else {
      toast.error('Vous devez être connecté pour personnaliser une histoire');
      router.push('/login');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template?.title,
          text: template?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Partage annulé ou non supporté');
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  const handleBack = () => {
    router.back();
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PDF Viewer Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              </div>

              {/* Informations Skeleton */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>

            <Card>
              <CardContent className="py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <Eye className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {error || 'Livre non trouvé'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  Impossible de charger les informations de ce livre.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header avec bouton retour */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la bibliothèque
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PDF Viewer */}
            <div className="space-y-4 order-2 lg:order-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Aperçu du livre</h2>
                {generatingPdf && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération en cours...
                  </div>
                )}
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Contrôles de navigation au-dessus du PDFViewer */}
                  {pdfUrl && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                      >
                        Précédent
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} sur {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}

                  {/* Logs de débogage pour vérifier l'affichage des contrôles */}
                  {(() => {
                    console.log('DEBUG - Contrôles de navigation:', {
                      pdfUrl: !!pdfUrl,
                      totalPages,
                      condition: pdfUrl && totalPages > 1,
                      currentPage,
                      shouldShowControls: pdfUrl && totalPages > 1
                    });
                    return null;
                  })()}
                  {pdfUrl ? (
                    (() => {
                      const fullPdfUrl = `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`;
                      console.log('BookDetailPage - URL PDF complète:', fullPdfUrl);
                      console.log('BookDetailPage - NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
                      console.log('BookDetailPage - pdfUrl relative:', pdfUrl);
                      return (
                        <PDFViewer
                          pdfUrl={pdfUrl}
                          currentPage={currentPage}
                          zoom={zoom}
                          onPageCountChange={setTotalPages}
                          onZoomChange={setZoom}
                          className="min-h-[600px]"
                        />
                      );
                    })()
                  ) : (
                    <div className="min-h-[600px] flex items-center justify-center bg-muted/50">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Préparation de l'aperçu...
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Informations du template */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Informations principales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{template.title}</CardTitle>
                  <CardDescription className="text-base">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    <Badge variant="outline">{template.ageRange}</Badge>
                    <Badge variant="outline">{template.language}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {template.gender === 'boy' ? 'Garçon' :
                       template.gender === 'girl' ? 'Fille' : 'Unisexe'}
                    </Badge>
                  </div>

                  {template.pageCount && (
                    <p className="text-sm text-muted-foreground">
                      {template.pageCount} pages
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCustomize}
                  className="flex-1"
                  size="lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Personnaliser cette histoire
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  size="lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}