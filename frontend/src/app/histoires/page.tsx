'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useHistoiresStore } from '@/stores/histoiresStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, SortAsc, Plus, Download, Eye } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import HistoireFilters from '@/components/HistoireFilters';
import HistoireCard from '@/components/HistoireCard';
import { Histoire } from '@/lib/histoireApi';

export default function HistoiresPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    histoires,
    templates,
    isLoading,
    error,
    filters,
    sortBy,
    searchQuery,
    fetchUserHistoires,
    fetchTemplates,
    setFilters,
    setSortBy,
    setSearchQuery,
    filteredHistoires,
    clearError,
  } = useHistoiresStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.userId) {
      fetchUserHistoires(user.userId);
    }
    fetchTemplates();
  }, [isAuthenticated, user?.userId, router, fetchUserHistoires, fetchTemplates]);

  const handleCreateNew = () => {
    router.push('/templates');
  };

  const handlePreview = (histoireId: string) => {
    router.push(`/histoires/preview/${histoireId}`);
  };

  const handleDownload = (histoire: any) => {
    if (histoire.generatedPdfUrl) {
      window.open(histoire.generatedPdfUrl, '_blank');
    }
  };

  const filteredStories = filteredHistoires();

  // Extraire les valeurs uniques pour les filtres
  const categories = [...new Set(templates.map(t => t.category))];
  const ageRanges = [...new Set(templates.map(t => t.ageRange))];
  const languages = [...new Set(templates.map(t => t.language))];

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Histoires</h1>
            <p className="text-muted-foreground mt-2">
              Gérez vos histoires personnalisées et créez-en de nouvelles
            </p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer une nouvelle histoire
          </Button>
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

        {/* Filters Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <HistoireFilters />
        </motion.div>

        {/* Stories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  {histoires.length === 0 ? (
                    <>
                      <p className="text-lg mb-2">Aucune histoire trouvée</p>
                      <p>Commencez par créer votre première histoire personnalisée !</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2">Aucun résultat</p>
                      <p>Essayez de modifier vos filtres de recherche.</p>
                    </>
                  )}
                </div>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une histoire
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((histoire, index) => {
                const template = templates.find(t => t._id === histoire.templateId);

                return (
                  <motion.div
                    key={histoire._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <HistoireCard
                      histoire={histoire}
                      template={template}
                      onEdit={() => {/* TODO: Implement edit */}}
                      onDelete={() => {/* TODO: Implement delete */}}
                      onShare={() => {/* TODO: Implement share */}}
                      onView={() => handlePreview(histoire._id)}
                      onDownload={() => handleDownload(histoire)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}