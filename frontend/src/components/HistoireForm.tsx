//frontend/src/components/HistoireForm.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, Eye, Sparkles, AlertCircle, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { detectVariables } from '@/lib/utils';
import { templatesApi, Template, EditorElement } from '@/lib/templatesApi';
import { useHistoiresStore } from '@/stores/histoiresStore';

interface HistoireFormProps {
  templateId: string;
  onPreview?: (variables: Record<string, string>) => void;
  onSubmit?: (variables: Record<string, string>) => Promise<void>;
  onShowPreview?: (variables: Record<string, string>) => void;
  className?: string;
  initialData?: {
    childName?: string;
    avatarUri?: string;
  };
}

// Schéma de validation dynamique basé sur les variables détectées
const createFormSchema = (variables: string[], initialData?: { childName?: string; avatarUri?: string }) => {
  const schema: Record<string, z.ZodType<any>> = {};

  variables.forEach(variable => {
    const lowerVar = variable.toLowerCase();

    if (lowerVar.includes('age') || lowerVar.includes('âge')) {
      schema[variable] = z.string()
        .min(1, `${variable} est requis`)
        .regex(/^\\d+$/, `${variable} doit être un nombre`)
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
    } else if (lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture') || lowerVar.includes('avatar')) {
      // If we have an avatar from initialData, accept string (DataURI) and make it optional
      if (initialData?.avatarUri) {
        schema[variable] = z.union([
          z.instanceof(File),
          z.string()
        ]).optional();
      } else {
        // Otherwise require a file upload
        schema[variable] = z.instanceof(File)
          .refine(file => file.size <= 5 * 1024 * 1024, 'L\'image ne doit pas dépasser 5MB')
          .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'L\'image doit être au format JPEG, PNG ou WebP');
      }
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
  onShowPreview,
  className,
  initialData
}: HistoireFormProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<string[]>([]);
  const [formSchema, setFormSchema] = useState<z.ZodObject<any> | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [editorElements, setEditorElements] = useState<EditorElement[]>([]);

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
        console.log('HistoireForm: Loading template with ID:', templateId);
        const templateData = await templatesApi.getTemplate(templateId);
        console.log('HistoireForm: Template loaded:', templateData);
        console.log('HistoireForm: Template coverPath:', templateData.coverPath);
        console.log('HistoireForm: Template variables:', templateData.variables);
        setTemplate(templateData);

        // Récupérer les éléments d'éditeur pour obtenir les valeurs par défaut
        const elements = await templatesApi.getEditorElements(templateId);
        console.log('HistoireForm: Editor elements loaded:', elements.length);
        elements.forEach((el, index) => {
          console.log(`HistoireForm: Element ${index}:`, {
            id: el.id,
            type: el.type,
            variableName: el.variableName,
            textContent: el.textContent
          });
        });
        setEditorElements(elements);

        const detectedVars = templateData.variables || [];
        console.log('HistoireForm: Detected variables from template:', detectedVars);
        setVariables(detectedVars);

        const schema = createFormSchema(detectedVars, initialData);
        setFormSchema(schema);

        // Extraire les valeurs par défaut des éléments d'éditeur
        const defaultValuesFromElements: Record<string, any> = {};
        elements.forEach(element => {
          if (element.defaultValues) {
            console.log('HistoireForm: Default values from element:', element.defaultValues);
            Object.assign(defaultValuesFromElements, element.defaultValues);
          }
        });

        // Initialiser les valeurs par défaut (valeurs des éléments d'abord, puis fallbacks)
        const defaultValues: Record<string, any> = {};
        detectedVars.forEach(variable => {
          const lowerVar = variable.toLowerCase();
          console.log(`HistoireForm: Setting default value for variable "${variable}"`);

          // Utiliser les valeurs par défaut des éléments d'éditeur si disponibles
          if (defaultValuesFromElements[variable] !== undefined) {
            defaultValues[variable] = defaultValuesFromElements[variable];
            console.log(`HistoireForm: Using default value from element for "${variable}":`, defaultValues[variable]);
          } else {
            // Check if initialData has a value for this variable
            if (initialData?.childName && (lowerVar.includes('nom') || lowerVar.includes('name'))) {
              defaultValues[variable] = initialData.childName;
              console.log(`HistoireForm: Using initialData childName for "${variable}":`, defaultValues[variable]);
            } else if (initialData?.avatarUri && (lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture') || lowerVar.includes('avatar'))) {
              defaultValues[variable] = initialData.avatarUri;
              console.log(`HistoireForm: Using initialData avatarUri for "${variable}":`, initialData.avatarUri.substring(0, 50) + '...');
            } else if (lowerVar.includes('nom') || lowerVar.includes('name')) {
              defaultValues[variable] = 'Adam';
            } else if (lowerVar.includes('âge') || lowerVar.includes('age')) {
              defaultValues[variable] = '5';
            } else if (lowerVar.includes('date') || lowerVar.includes('naissance')) {
              const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
              defaultValues[variable] = currentDate;
            } else if (lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture')) {
              defaultValues[variable] = undefined;
              console.log(`HistoireForm: Setting undefined default for image variable "${variable}"`);
            } else {
              defaultValues[variable] = '';
            }
            console.log(`HistoireForm: Using fallback default for "${variable}":`, defaultValues[variable]);
          }
        });
        console.log('HistoireForm: Final default values:', defaultValues);
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
    const isImageField = lowerVar.includes('image') || lowerVar.includes('photo') || lowerVar.includes('picture') || lowerVar.includes('avatar');
    const isDateField = lowerVar.includes('date') || lowerVar.includes('naissance');
    const isAgeField = lowerVar.includes('age') || lowerVar.includes('âge');
    const label = variable.charAt(0).toUpperCase() + variable.slice(1).replace(/([A-Z])/g, ' $1');
    const placeholder = label; // Placeholder takes the value of the label

    // If it's an image field and we have an avatar URI from initialData, skip rendering the upload field
    if (isImageField && initialData?.avatarUri) {
      console.log(`HistoireForm: Skipping image field "${variable}" because avatar is provided via initialData`);
      return null;
    }

    return (
      <FormField
        key={variable}
        control={form.control}
        name={variable}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {label}
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
                  placeholder={placeholder}
                  {...field}
                  value={field.value || ''}
                />
              ) : isAgeField ? (
                <Input
                  type="number"
                  min="1"
                  max="18"
                  placeholder={placeholder}
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              ) : (
                <Input
                  type="text"
                  placeholder={placeholder}
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
      console.log('[DEBUG] [HistoireForm] Starting form submission with data:', data);

      // Upload images first if any
      const formData = new FormData();
      const imageFields: Record<string, string> = {};

      // Prepare form data with images - use variable names as field names
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`[DEBUG] [HistoireForm] Adding image file for variable "${key}":`, value.name, value.size, 'bytes');
          // Use the variable name as the field name for the image
          formData.append(`images_${key}`, value);
          // Store the mapping for later use
          imageFields[key] = `images_${key}`;
        }
      });

      console.log('[DEBUG] [HistoireForm] Image fields mapping:', imageFields);

      // Add other variables
      const variables: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (!(value instanceof File)) {
          variables[key] = value;
        }
      });

      console.log('[DEBUG] [HistoireForm] Non-image variables:', variables);

      formData.append('templateId', templateId);
      formData.append('variables', JSON.stringify(variables));
      formData.append('imageFields', JSON.stringify(imageFields));

      console.log('[DEBUG] [HistoireForm] FormData prepared, sending to backend...');

      try {
        // Upload images and generate histoire
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const endpoint = `${apiUrl}/histoires/generate`;
        console.log('[DEBUG] [HistoireForm] Making request to:', endpoint);

        const response = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        console.log('[DEBUG] [HistoireForm] Backend response status:', response.status);
        console.log('[DEBUG] [HistoireForm] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = 'Failed to generate histoire';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('[DEBUG] [HistoireForm] Backend error details:', errorData);
          } catch (parseError) {
            console.error('[DEBUG] [HistoireForm] Could not parse error response:', parseError);
            // Try to get text response
            try {
              const errorText = await response.text();
              console.error('[DEBUG] [HistoireForm] Raw error response:', errorText);
            } catch (textError) {
              console.error('[DEBUG] [HistoireForm] Could not get error response text:', textError);
            }
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('[DEBUG] [HistoireForm] Histoire generation successful:', result);
        console.log('[DEBUG] [HistoireForm] Result type:', typeof result);
        console.log('[DEBUG] [HistoireForm] Result keys:', Object.keys(result));
        console.log('[DEBUG] [HistoireForm] Result.histoire:', result.histoire);
        console.log('[DEBUG] [HistoireForm] Result.success:', result.success);

        // Convert Cloudinary URLs to local URLs for images
        if (result.histoire && result.histoire.previewUrls) {
          result.histoire.previewUrls = result.histoire.previewUrls.map((url: string) => {
            if (url.includes('res.cloudinary.com')) {
              // Convert Cloudinary URL to local URL
              const filename = url.split('/').pop()?.split('.')[0];
              return `${apiUrl}/uploads/previews/${filename}.png`;
            }
            return url;
          });
        }

        console.log('[DEBUG] [HistoireForm] About to call onSubmit with result');
        await onSubmit(result);
        console.log('[DEBUG] [HistoireForm] onSubmit called successfully');
      } catch (error) {
        console.error('[DEBUG] [HistoireForm] Error generating histoire:', error);
        console.error('[DEBUG] [HistoireForm] Error details:', {
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name
        });
        throw error;
      }
    }
  };

  if (!template || !formSchema) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className ? `${className} w-full` : "w-full"}
    >
      {/* Template Cover Image - Optional, maybe remove if it takes too much space in the panel */}
      {/* 
      {template?.coverPath && (
        <div className="mb-6">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${template.coverPath}`}
            alt={`Couverture de ${template.title}`}
            className="w-full h-32 object-cover rounded-lg shadow-sm"
          />
        </div>
      )}
      */}

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#0055FF]" />
          <h2 className="text-lg font-semibold text-slate-900">
            Personnalisation
          </h2>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-100 text-red-900" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {variables.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-sm">
                Aucune variable à personnaliser pour ce template.
              </p>
            ) : (
              variables.map(renderFormField)
            )}

            <div className="pt-4">
              {onShowPreview && (
                <Button
                  type="button"
                  onClick={() => {
                    if (form.formState.isValid) {
                      const formData = form.getValues();
                      const variablesWithUrls = { ...formData };
                      Object.keys(variablesWithUrls).forEach(key => {
                        if (variablesWithUrls[key] instanceof File) {
                          variablesWithUrls[key] = imagePreviews[key] || '';
                        }
                      });
                      onShowPreview(variablesWithUrls);
                    }
                  }}
                  disabled={!form.formState.isValid}
                  className="w-full bg-[#0055FF] hover:bg-[#0044CC] text-white shadow-lg shadow-blue-500/20 h-11 text-base"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Générer l'histoire
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}