'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.enum(['super hero', 'aventure', 'animal', 'éducation']),
  gender: z.enum(['boy', 'girl', 'unisex']),
  ageRange: z.enum(['3 ans - 5ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans']),
  language: z.string().min(1, 'La langue est requise'),
  isPublished: z.boolean(),
  pdf: z.instanceof(File).optional(),
  cover: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Template {
  _id: string;
  title: string;
  description: string;
  category: 'super hero' | 'aventure' | 'animal' | 'éducation';
  gender: 'boy' | 'girl' | 'unisex';
  ageRange: '3 ans - 5ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
  language: string;
  pdfPath: string;
  coverPath: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PDFMetadata {
  pageCount: number;
  dimensions: string;
}

export default function EditTemplatePage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);

  // Utiliser le hook de rafraîchissement des tokens
  useTokenRefresh();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: undefined,
      gender: undefined,
      ageRange: undefined,
      language: 'fr',
      isPublished: false,
    },
  });

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
    };
    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/book-store');
      return;
    }

    fetchTemplate();
  }, [isAuthenticated, user, router, templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates/${templateId}`, {
        withCredentials: true,
      });
      const templateData = response.data;
      setTemplate(templateData);

      // Pré-remplir le formulaire avec les données existantes
      form.reset({
        title: templateData.title,
        description: templateData.description,
        category: templateData.category,
        gender: templateData.gender,
        ageRange: templateData.ageRange,
        language: templateData.language,
        isPublished: templateData.isPublished,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      alert('Erreur lors de la récupération du template');
      router.push('/admin/templates');
    } finally {
      setFetchLoading(false);
    }
  };

  const extractPDFMetadata = async (file: File) => {
    // Note: In a real implementation, you'd use a library like pdf-lib or pdfjs-dist
    // For now, we'll simulate metadata extraction
    const mockMetadata: PDFMetadata = {
      pageCount: Math.floor(Math.random() * 20) + 5, // Random page count between 5-25
      dimensions: 'A4 (210 × 297 mm)',
    };
    setPdfMetadata(mockMetadata);
  };

  const handlePDFFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      form.setValue('pdf', file);
      extractPDFMetadata(file);
    }
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      form.setValue('cover', file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('gender', data.gender);
      formData.append('ageRange', data.ageRange);
      formData.append('language', data.language);
      formData.append('isPublished', data.isPublished.toString());

      if (data.pdf) {
        formData.append('pdf', data.pdf);
      }
      if (data.cover) {
        formData.append('cover', data.cover);
      }

      const response = await axios.put(`${API_BASE_URL}/templates/${templateId}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        alert('Template mis à jour avec succès !');
        router.push(`/admin/templates/${templateId}/editor`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du template:', error);
      alert('Erreur lors de la mise à jour du template');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Modifier le Template</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Modifiez les données du template.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez le titre du template"
                        {...field}
                        aria-describedby="title-description"
                      />
                    </FormControl>
                    <FormDescription id="title-description">
                      Le titre qui sera affiché aux utilisateurs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Entrez la description du template"
                        className="min-h-[100px]"
                        {...field}
                        aria-describedby="description-description"
                      />
                    </FormControl>
                    <FormDescription id="description-description">
                      Une description détaillée du template.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="category-description">
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super hero">Super Héros</SelectItem>
                        <SelectItem value="aventure">Aventure</SelectItem>
                        <SelectItem value="animal">Animal</SelectItem>
                        <SelectItem value="éducation">Éducation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription id="category-description">
                      La catégorie thématique du template.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="gender-description">
                          <SelectValue placeholder="Sélectionnez un genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="girl">Fille</SelectItem>
                        <SelectItem value="boy">Garçon</SelectItem>
                        <SelectItem value="unisex">Unisexe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription id="gender-description">
                      Le genre cible du template.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tranche d'âge</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="ageRange-description">
                          <SelectValue placeholder="Sélectionnez une tranche d'âge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3 ans - 5ans">3 ans - 5 ans</SelectItem>
                        <SelectItem value="6 ans - 8 ans">6 ans - 8 ans</SelectItem>
                        <SelectItem value="9 ans - 11 ans">9 ans - 11 ans</SelectItem>
                        <SelectItem value="12 ans - 15 ans">12 ans - 15 ans</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription id="ageRange-description">
                      La tranche d'âge recommandée pour ce template.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez la langue (ex: fr, en)"
                        {...field}
                        aria-describedby="language-description"
                      />
                    </FormControl>
                    <FormDescription id="language-description">
                      La langue du template (par défaut: fr).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-describedby="isPublished-description"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publié</FormLabel>
                      <FormDescription id="isPublished-description">
                        Cochez cette case pour publier immédiatement le template.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdf"
                render={() => (
                  <FormItem>
                    <FormLabel>Fichier PDF (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handlePDFFileChange}
                        aria-describedby="pdf-description"
                      />
                    </FormControl>
                    <FormDescription id="pdf-description">
                      Sélectionnez un nouveau fichier PDF si vous souhaitez le remplacer.
                    </FormDescription>
                    {pdfMetadata && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Métadonnées PDF :</strong>
                        </p>
                        <p className="text-sm">Pages : {pdfMetadata.pageCount}</p>
                        <p className="text-sm">Dimensions : {pdfMetadata.dimensions}</p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover"
                render={() => (
                  <FormItem>
                    <FormLabel>Image de couverture (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileChange}
                        aria-describedby="cover-description"
                      />
                    </FormControl>
                    <FormDescription id="cover-description">
                      Sélectionnez une nouvelle image de couverture si vous souhaitez la remplacer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/templates')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Mise à jour en cours...' : 'Mettre à jour le Template'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}