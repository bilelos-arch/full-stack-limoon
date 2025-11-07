'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
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
  category: z.enum(['contes-et-aventures-imaginaires', 'heros-du-quotidien', 'histoires-avec-des-animaux', 'histoires-educatives', 'valeurs-et-developpement-personnel', 'vie-quotidienne-et-ecole', 'fetes-et-occasions-speciales', 'exploration-et-science-fiction', 'culture-et-traditions', 'histoires-du-soir']),
  gender: z.enum(['boy', 'girl', 'unisex']),
  ageRange: z.enum(['3 ans - 5 ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans']),
  language: z.enum(['français', 'anglais', 'arabe']),
  isPublished: z.boolean(),
  pdf: z.instanceof(File, { message: 'Le fichier PDF est requis' }),
  cover: z.instanceof(File, { message: 'L\'image de couverture est requise' }),
});

type FormData = z.infer<typeof formSchema>;

interface PDFMetadata {
  pageCount: number;
  dimensions: string;
}

export default function NewTemplatePage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

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
      language: 'français',
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
  }, [isAuthenticated, user, router]);

  const extractPDFMetadata = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');

      // Set the worker source (utiliser le worker local)
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      // Get dimensions from first page
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const dimensions = `${Math.round(viewport.width)} × ${Math.round(viewport.height)} mm`;

      const metadata: PDFMetadata = {
        pageCount,
        dimensions,
      };
      setPdfMetadata(metadata);
    } catch (error) {
      console.error('Erreur lors de l\'extraction des métadonnées PDF:', error);
      // Fallback to mock data if extraction fails
      const mockMetadata: PDFMetadata = {
        pageCount: 1,
        dimensions: 'A4 (210 × 297 mm)',
      };
      setPdfMetadata(mockMetadata);
    }
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
      // Vérification de l'authentification avant l'envoi
      if (!isAuthenticated) {
        throw new Error('Vous devez être connecté pour créer un template');
      }

      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('Raw form data:', data);
      console.log('data.ageRange type:', typeof data.ageRange);
      console.log('data.ageRange value:', data.ageRange);
      console.log('data.ageRange is undefined:', data.ageRange === undefined);
      console.log('data.ageRange is null:', data.ageRange === null);

      const formData = new FormData();
      console.log('=== FORM DATA DEBUG ===');
      console.log('Appending ageRange:', data.ageRange);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('gender', data.gender);
      formData.append('ageRange', data.ageRange);
      formData.append('language', data.language);
      formData.append('isPublished', data.isPublished.toString());
      formData.append('pdf', data.pdf);
      formData.append('cover', data.cover);

      // Log FormData contents
      console.log('=== FORM DATA CONTENTS ===');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`${API_BASE_URL}/templates`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('Template créé avec succès !');
        router.push(`/admin/templates/${response.data._id}/editor`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du template:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Afficher le message d'erreur exact du backend
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data || 'Erreur inconnue';
        
        if (status === 401) {
          alert(`Erreur d'authentification (401): ${message}. Veuillez vous reconnecter.`);
          router.push('/login');
        } else if (status === 400) {
          alert(`Erreur de validation (400): ${message}`);
        } else if (status === 403) {
          alert(`Accès refusé (403): ${message}. Vous devez être administrateur.`);
        } else {
          alert(`Erreur serveur (${status}): ${message}`);
        }
      } else {
        alert(`Erreur réseau: ${error.message || 'Connexion échouée'}`);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Nouveau Template</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Créez un nouveau template pour les histoires personnalisées.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="category-description">
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contes-et-aventures-imaginaires">Contes et aventures imaginaires</SelectItem>
                        <SelectItem value="heros-du-quotidien">Héros du quotidien</SelectItem>
                        <SelectItem value="histoires-avec-des-animaux">Histoires avec des animaux</SelectItem>
                        <SelectItem value="histoires-educatives">Histoires éducatives</SelectItem>
                        <SelectItem value="valeurs-et-developpement-personnel">Valeurs et développement personnel</SelectItem>
                        <SelectItem value="vie-quotidienne-et-ecole">Vie quotidienne et école</SelectItem>
                        <SelectItem value="fetes-et-occasions-speciales">Fêtes et occasions spéciales</SelectItem>
                        <SelectItem value="exploration-et-science-fiction">Exploration et science-fiction</SelectItem>
                        <SelectItem value="culture-et-traditions">Culture et traditions</SelectItem>
                        <SelectItem value="histoires-du-soir">Histoires du soir</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="ageRange-description">
                          <SelectValue placeholder="Sélectionnez une tranche d'âge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3 ans - 5 ans">3 ans - 5 ans</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger aria-describedby="language-description">
                          <SelectValue placeholder="Sélectionnez une langue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="français">Français</SelectItem>
                        <SelectItem value="anglais">Anglais</SelectItem>
                        <SelectItem value="arabe">Arabe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription id="language-description">
                      La langue du template.
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
                    <FormLabel>Fichier PDF</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handlePDFFileChange}
                        aria-describedby="pdf-description"
                      />
                    </FormControl>
                    <FormDescription id="pdf-description">
                      Sélectionnez le fichier PDF du template.
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
                    <FormLabel>Image de couverture</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileChange}
                        aria-describedby="cover-description"
                      />
                    </FormControl>
                    <FormDescription id="cover-description">
                      Sélectionnez une image de couverture pour le template.
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
                  {loading ? 'Création en cours...' : 'Créer le Template'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}