'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';

interface Template {
  _id: string;
  title: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminTemplatesPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Utiliser le hook de rafraîchissement des tokens
  useTokenRefresh();

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

    fetchTemplates();
  }, [isAuthenticated, user, router]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates`, {
        withCredentials: true,
      });
      setTemplates(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/templates/${id}`, {
        withCredentials: true,
      });
      setTemplates(templates.filter(template => template._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      alert('Erreur lors de la suppression du template');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/templates/${id}/edit`);
  };


  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gestion des Templates</h1>
            <Button onClick={() => router.push('/admin/templates/new')}>
              ➕ Nouveau Template
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Publié</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>{template.gender}</TableCell>
                  <TableCell>{template.ageRange}</TableCell>
                  <TableCell>
                    {template.isPublished ? (
                      <span className="text-green-600">Oui</span>
                    ) : (
                      <span className="text-red-600">Non</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template._id)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(template._id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun template trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}