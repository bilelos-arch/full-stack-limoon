'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { detectVariables } from '@/lib/utils';
import { templatesApi, Template } from '@/lib/templatesApi';
import { useHistoiresStore } from '@/stores/histoiresStore';

interface HistoireFormProps {
  templateId: string;
  onPreview?: (variables: Record<string, string>) => void;
  onSubmit?: (variables: Record<string, string>) => Promise<void>;
  className?: string;
}

// Schéma de validation dynamique basé sur les variables détectées
const createFormSchema = (variables: string[]) => {
  const schema: Record<string, z.ZodType<any>> = {};

  variables.forEach(variable => {
    const lowerVar = variable.toLowerCase();

    if (lowerVar.includes('age') || lowerVar.includes('âge')) {
      schema[variable] = z.string()
        .min(1, `${variable} est requis`)
        .regex(/^\d+$/, `${variable} doit être un nombre`)
        .transform(val => parseInt(val))
        .refine(val => val >= 1 && val <= 18, `${variable} doit être entre 1 et 18`);
    } else if (lowerVar.includes('date') || lowerVar.includes('naissance')) {
      schema[variable] = z.string()
        .min(1, `${variable} est requis`)
        .refine(val => !isNaN(Date.parse(val)), `${variable} doit être une date valide`);
    } else if (lowerVar.includes('email')) {
      schema[variable] = z.string()
        .min(1, `${variable} est requis`)
        .email(`${variable} doit être un email valide`);
    } else if (lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture')) {
      schema[variable] = z.instanceof(File)
        .refine(file => file.size <= 5 * 1024 * 1024, 'L\'image ne doit pas dépasser 5MB')
        .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
          'L\'image doit être au format JPEG, PNG ou WebP');
    } else {
      schema[variable] = z.string()
        .min(1, `${variable} est requis`)
        .max(100, `${variable} ne doit pas dépasser 100 caractères`);
    }
  });

  return z.object(schema);
};

export default function HistoireForm({
  templateId,
  onPreview,
  onSubmit,
  className
}: HistoireFormProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [formSchema, setFormSchema] = useState<z.ZodObject<any> | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

  const { isLoading, error, clearError } = useHistoiresStore();

  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: {} as Record<string, any>,
    mode: 'onChange'
  });

  // Charger le template et initialiser le formulaire
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templateData = await templatesApi.getTemplate(templateId);
        setTemplate(templateData);

        const detectedVars = detectVariables(templateData.description || '');
        setVariables(detectedVars);

        const schema = createFormSchema(detectedVars);
        setFormSchema(schema);

        // Initialiser les valeurs par défaut
        const defaultValues: Record<string, any> = {};
        detectedVars.forEach(variable => {
          const lowerVar = variable.toLowerCase();
          if (lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture')) {
            defaultValues[variable] = undefined;
          } else {
            defaultValues[variable] = '';
          }
        });
        form.reset(defaultValues);
      } catch (error) {
        console.error('Erreur lors du chargement du template:', error);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId, form]);

  // Debounced preview generation
  const generatePreview = useCallback(() => {
    if (onPreview && form.formState.isValid) {
      const formData = form.getValues();
      // Convertir les fichiers en URLs pour l'aperçu
      const variablesWithUrls = { ...formData };
      Object.keys(variablesWithUrls).forEach(key => {
        if (variablesWithUrls[key] instanceof File) {
          variablesWithUrls[key] = imagePreviews[key] || '';
        }
      });
      onPreview(variablesWithUrls);
    }
  }, [form, onPreview, variables, imagePreviews]);

  // Watcher pour la génération d'aperçu
  useEffect(() => {
    const subscription = form.watch(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        generatePreview();
      }, 800);

      setDebounceTimer(timer);
    });

    return () => subscription.unsubscribe();
  }, [form, generatePreview, debounceTimer]);

  const handleFileChange = (variable: string, file: File | null) => {
    if (file) {
      form.setValue(variable, file);

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [variable]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue(variable, undefined);
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[variable];
        return newPreviews;
      });
    }
  };

  const renderFormField = (variable: string) => {
    const lowerVar = variable.toLowerCase();
    const isImageField = lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture');
    const isDateField = lowerVar.includes('date') || lowerVar.includes('naissance');
    const isAgeField = lowerVar.includes('age') || lowerVar.includes('âge');

    return (
      <FormField
        key={variable}
        control={form.control}
        name={variable}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1')}
            </FormLabel>
            <FormControl>
              {isImageField ? (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(variable, file);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {imagePreviews[variable] && (
                    <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreviews[variable]}
                        alt={`Aperçu ${variable}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : isDateField ? (
                <Input
                  type="date"
                  {...field}
                  value={field.value || ''}
                />
              ) : isAgeField ? (
                <Input
                  type="number"
                  min="1"
                  max="18"
                  placeholder="Ex: 5"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              ) : (
                <Input
                  type="text"
                  placeholder={`Entrez ${variable.toLowerCase()}`}
                  {...field}
                  value={field.value || ''}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (onSubmit) {
      // Pour les images, on pourrait avoir besoin d'uploader d'abord
      // Pour l'instant, on passe les données telles quelles
      await onSubmit(data);
    }
  };

  if (!template || !formSchema) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Personnalisez votre histoire
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {variables.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune variable à personnaliser pour ce template.
                </p>
              ) : (
                variables.map(renderFormField)
              )}

              <div className="flex gap-4 pt-4 border-t">
                {onPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePreview}
                    disabled={!form.formState.isValid}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                )}

                {onSubmit && (
                  <Button
                    type="submit"
                    disabled={isLoading || !form.formState.isValid}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}