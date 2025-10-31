'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { templatesApi, Template } from '@/lib/templatesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, Eye, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { detectVariables } from '@/lib/utils';
import HistoireForm from '@/components/HistoireForm';
import HistoirePreview from '@/components/HistoirePreview';

interface FormData {
  [key: string]: string;
}

export default function CreerHistoirePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { generateHistoire, isLoading, error, clearError } = useHistoiresStore();

  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const templateId = params.templateId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (templateId) {
      loadTemplate();
    }
  }, [isAuthenticated, templateId, router]);

  const loadTemplate = async () => {
    try {
      const templateData = await templatesApi.getTemplate(templateId);
      setTemplate(templateData);

      // Initialize form data with detected variables
      const variables = detectVariables(templateData.description || '');
      const initialFormData: FormData = {};
      variables.forEach(variable => {
        initialFormData[variable] = '';
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Erreur lors du chargement du template:', error);
    }
  };

  const handleInputChange = useCallback((variable: string, value: string) => {
    setFormData(prev => ({ ...prev, [variable]: value }));

    // Debounced preview generation (800ms)
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      generatePreview();
    }, 800);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  const generatePreview = async () => {
    if (!template || !user?.userId) return;

    try {
      // For now, we'll simulate preview generation
      // In a real implementation, this would call a preview API
      setPreviewUrl(null); // Reset preview while generating

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set a placeholder preview URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      setPreviewUrl(`${API_BASE_URL}/uploads/${template.coverPath}`);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu:', error);
    }
  };

  const handleGenerate = async () => {
    if (!template || !user?.userId) return;

    setIsGenerating(true);
    try {
      const histoire = await generateHistoire({
        templateId: template._id,
        variables: formData,
      });

      if (histoire) {
        router.push(`/histoires/preview/${histoire._id}`);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (variable: string, file: File) => {
    // For now, we'll just store the file name
    // In a real implementation, this would upload the file and store the URL
    setFormData(prev => ({ ...prev, [variable]: file.name }));
  };

  const renderFormField = (variable: string) => {
    const value = formData[variable] || '';

    // Determine field type based on variable name (simple heuristic)
    const isImageField = variable.toLowerCase().includes('image') ||
                        variable.toLowerCase().includes('photo') ||
                        variable.toLowerCase().includes('picture');

    const isDateField = variable.toLowerCase().includes('date') ||
                       variable.toLowerCase().includes('naissance');

    const isAgeField = variable.toLowerCase().includes('age') ||
                      variable.toLowerCase().includes('âge');

    if (isImageField) {
      return (
        <div className="space-y-2">
          <Label htmlFor={variable} className="text-sm font-medium">
            {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id={variable}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(variable, file);
                }
              }}
              className="flex-1"
            />
            {value && (
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isDateField) {
      return (
        <div className="space-y-2">
          <Label htmlFor={variable} className="text-sm font-medium">
            {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
          </Label>
          <Input
            id={variable}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(variable, e.target.value)}
            className="w-full"
          />
        </div>
      );
    }

    if (isAgeField) {
      return (
        <div className="space-y-2">
          <Label htmlFor={variable} className="text-sm font-medium">
            {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
          </Label>
          <Input
            id={variable}
            type="number"
            min="1"
            max="18"
            value={value}
            onChange={(e) => handleInputChange(variable, e.target.value)}
            placeholder="Ex: 5"
            className="w-full"
          />
        </div>
      );
    }

    // Default text field
    return (
      <div className="space-y-2">
        <Label htmlFor={variable} className="text-sm font-medium">
          {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
        </Label>
        <Input
          id={variable}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(variable, e.target.value)}
          placeholder={`Entrez ${variable.toLowerCase()}`}
          className="w-full"
        />
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-64 w-full mb-6" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
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

  const variables = detectVariables(template.description || '');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold text-foreground">Personnaliser l'histoire</h1>
              <p className="text-muted-foreground mt-1">{template.title}</p>
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
                onPreview={(variables) => {
                  // Générer l'aperçu avec les variables
                  generatePreview();
                }}
                onSubmit={async (variables) => {
                  await handleGenerate();
                }}
              />
            </motion.div>

            {/* Preview Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HistoirePreview
                pdfUrl={previewUrl || undefined}
                isLoading={isGenerating}
                error={error}
                onRetry={() => generatePreview()}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}