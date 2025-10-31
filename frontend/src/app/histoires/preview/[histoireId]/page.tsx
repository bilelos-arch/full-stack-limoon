'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { histoireApi, Histoire } from '@/lib/histoireApi';
import { templatesApi, Template } from '@/lib/templatesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Edit, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import PDFPreviewModal from '@/components/PDFPreviewModal';

export default function PreviewHistoirePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();

  const [histoire, setHistoire] = useState<Histoire | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const histoireId = params.histoireId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (histoireId) {
      loadHistoire();
    }
  }, [isAuthenticated, histoireId, router]);

  const loadHistoire = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const histoireData = await histoireApi.getHistoire(histoireId);
      setHistoire(histoireData);

      // Load template data
      if (histoireData.templateId) {
        const templateData = await templatesApi.getTemplate(histoireData.templateId);
        setTemplate(templateData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'histoire:', error);
      setError('Erreur lors du chargement de l\'histoire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (histoire?.generatedPdfUrl) {
      window.open(histoire.generatedPdfUrl, '_blank');
    }
  };

  const handleEdit = () => {
    if (histoire?.templateId) {
      router.push(`/histoires/creer/${histoire.templateId}`);
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    {histoire.generatedPdfUrl ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-40 bg-white border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                            <div className="text-4xl">📄</div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            PDF généré avec succès
                          </p>
                          <Button onClick={() => setShowPDFModal(true)} variant="outline">
                            Aperçu du PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-32 h-40 bg-muted rounded-lg flex items-center justify-center mb-4 mx-auto">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <p>Génération du PDF en cours...</p>
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