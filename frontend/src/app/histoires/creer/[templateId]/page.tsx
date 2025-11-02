//frontend/src/app/histoires/creer/[templateId]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { templatesApi, Template } from '@/lib/templatesApi';
import { histoireApi } from '@/lib/histoireApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import HistoireForm from '@/components/HistoireForm';
import HistoirePreview from '@/components/HistoirePreview';

export default function CreerHistoirePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { generateHistoire, isLoading, error, clearError } = useHistoiresStore();

  const [template, setTemplate] = useState<Template | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const templateId = params.templateId as string;

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
    }
  }, [isAuthenticated, templateId, router]);

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

  const handlePreview = useCallback(async (variables: Record<string, string>) => {
    if (!template || !user?._id) return;

    setIsGeneratingPreview(true);
    try {
      // Call preview API using histoireApi
      const data = await histoireApi.generatePreview(templateId, variables);
      setPreviewImages(data.previewUrls || []);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu:', error);
      setPreviewImages([]);
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [template, user?._id, templateId]);

  const handleGenerate = async (variables: Record<string, string>) => {
    console.log('handleGenerate called with variables:', variables);
    console.log('template:', template);
    console.log('user:', user);
    console.log('user?._id:', user?._id);
    console.log('isAuthenticated:', isAuthenticated);

    if (!template || !user?._id) {
      console.error('Missing template or user:', { template: !!template, userId: user?._id, user: user, isAuthenticated });
      console.error('Full user object:', JSON.stringify(user, null, 2));
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Calling generateHistoire with:', {
        templateId: templateId,
        variables,
      });
      const histoire = await generateHistoire({
        templateId: templateId,
        variables,
      });

      console.log('generateHistoire returned:', histoire);

      if (histoire) {
        console.log('Navigating to preview page:', `/histoires/preview/${histoire._id}`);
        router.push(`/histoires/preview/${histoire._id}`);
      } else {
        console.error('generateHistoire returned null');
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Personnaliser l'histoire</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">{template.title}</p>
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HistoireForm
                templateId={templateId}
                onPreview={handlePreview}
                onSubmit={handleGenerate}
              />
            </motion.div>

            {/* Preview Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full"
            >
              <HistoirePreview
                previewImages={previewImages}
                isLoading={isGeneratingPreview || isGenerating}
                error={error}
                onRetry={() => handlePreview({})}
                className="w-full"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}