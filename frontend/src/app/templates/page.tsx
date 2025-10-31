'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Template {
  _id: string;
  title: string;
  description: string;
  category: 'super hero' | 'aventure' | 'animal' | 'éducation';
  gender: 'boy' | 'girl' | 'unisex';
  ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
  language: string;
  pdfPath: string;
  coverPath: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates?isPublished=true`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = (id: string) => {
    if (isAuthenticated) {
      router.push(`/histoires/creer/${id}`);
    } else {
      router.push(`/templates/${id}/customize`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Templates Disponibles</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choisissez un template pour créer votre histoire personnalisée
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={`${API_BASE_URL}/uploads/${template.coverPath}`}
                  alt={template.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{template.title}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Catégorie:</span>
                    <span>{template.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Genre:</span>
                    <span>{template.gender}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Âge:</span>
                    <span>{template.ageRange}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Langue:</span>
                    <span>{template.language}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleCustomize(template._id)}
                  className="w-full"
                >
                  Personnaliser
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucun template disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}