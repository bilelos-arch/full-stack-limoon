//frontend/src/app/admin/templates/[id]/editor/page.tsx
'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import PDFViewer from '@/components/PDFViewer';
import EditorElementOverlay from '@/components/EditorElementOverlay';
import ElementPropertiesPanel from '@/components/ElementPropertiesPanel';
import { DndContext } from '@dnd-kit/core';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Template {
  _id: string;
  title: string;
  description: string;
  pdfPath: string;
  pageCount: number;
  dimensions: { width: number; height: number }; // Dimensions ORIGINALES du PDF
}

interface EditorElement {
  id: string;
  templateId: string;
  type: 'text' | 'image';
  pageIndex: number;
  x: number; // Pourcentage relatif (0-100)
  y: number; // Pourcentage relatif (0-100)
  width: number; // Pourcentage relatif (0-100)
  height: number; // Pourcentage relatif (0-100)
  textContent?: string;
  font?: string;
  fontSize?: number;
  fontStyle?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  googleFont?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  variableName?: string;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [elementsRelative, setElementsRelative] = useState<EditorElement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [actualPageCount, setActualPageCount] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<EditorElement | null>(null);
  const [renderedPdfDimensions, setRenderedPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // ⚠️ CORRECTION : Stocker les dimensions ORIGINALES du PDF
  const [originalPdfDimensions, setOriginalPdfDimensions] = useState<{width: number, height: number} | null>(null);

  // État pour les valeurs par défaut des variables
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({});

  // Fonction pour détecter les variables dans le textContent
  const detectVariables = useCallback((text: string): string[] => {
    if (typeof window === 'undefined') return []; // SSR safe
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  }, []);

  // Fonction pour mettre à jour les valeurs par défaut des variables
  const updateDefaultValue = useCallback((variableName: string, value: string) => {
    setDefaultValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  }, []);

  const loadTemplate = useCallback(async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates/${id}`, {
        withCredentials: true,
      });
      setTemplate(response.data);
      
      // ⚠️ CORRECTION : Stocker les dimensions originales du PDF
      if (response.data.dimensions) {
        setOriginalPdfDimensions(response.data.dimensions);
        console.log('Original PDF dimensions stored:', response.data.dimensions);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du template:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors du chargement du template: ${errorMessage}`);
      router.push('/admin/templates');
    }
  }, [router]);

  const loadElements = useCallback(async (templateId: string) => {
    try {
      console.log('=== FRONTEND LOAD ELEMENTS ===');
      console.log('Loading elements for template:', templateId);
      const response = await axios.get(`${API_BASE_URL}/templates/${templateId}/elements`, {
        withCredentials: true,
      });
      console.log('Elements loaded from backend:', response.data);
      console.log('Number of elements:', response.data.length);
      response.data.forEach((el: any, index: number) => {
        console.log(`Element ${index}:`, {
          id: el.id,
          type: el.type,
          pageIndex: el.pageIndex,
          x: el.x + '%', // Coordonnées relatives
          y: el.y + '%',
          width: el.width + '%',
          height: el.height + '%',
          textContent: el.textContent
        });
      });
      setElementsRelative(response.data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des éléments:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors du chargement des éléments: ${errorMessage}`);
    }
  }, []);

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
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const id = params.id as string;
    if (id && isAuthenticated && user?.role === 'admin') {
      loadTemplate(id);
      loadElements(id);
    }
  }, [params.id, isAuthenticated, user, loadTemplate, loadElements]);

  useEffect(() => {
    setLoading(false);
  }, [template, elementsRelative]);

  const handleAddText = () => {
    if (!template || !originalPdfDimensions) return;
    
    // CRITIQUE : Utiliser les dimensions ORIGINALES pour les calculs
    const actualDimensions = originalPdfDimensions;
    
    // Dimensions en pourcentages relatifs
    const targetWidthPercent = 15; // 15% de la largeur originale
    const targetHeightPercent = 5; // 5% de la hauteur originale
    
    const newElement: EditorElement = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template._id,
      type: 'text',
      pageIndex: currentPage - 1,
      x: 10, // 10% de la largeur
      y: 10, // 10% de la hauteur
      width: targetWidthPercent, // 15% de la largeur
      height: targetHeightPercent, // 5% de la hauteur
      textContent: 'Nouveau texte',
      font: 'Arial',
      color: '#000000',
      alignment: 'left',
    };
    setElementsRelative(prev => [...prev, newElement]);
  };

  const handleAddImage = () => {
    if (!template || !originalPdfDimensions) return;
    
    // Dimensions en pourcentages relatifs
    const targetWidthPercent = 20; // 20% de la largeur originale
    const targetHeightPercent = 15; // 15% de la hauteur originale
    
    const newElement: EditorElement = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template._id,
      type: 'image',
      pageIndex: currentPage - 1,
      x: 10, // 10% de la largeur
      y: 10, // 10% de la hauteur
      width: targetWidthPercent, // 20% de la largeur
      height: targetHeightPercent, // 15% de la hauteur
    };
    setElementsRelative(prev => [...prev, newElement]);
  };

  const handleDelete = () => {
    if (selectedElement) {
      setElementsRelative(prev => prev.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
    }
  };

  const handleSave = async () => {
    if (!template) return;

    console.log('=== FRONTEND SAVE ELEMENTS ===');
    console.log('Template ID:', template._id);
    console.log('Elements to save (RELATIVE COORDINATES):', elementsRelative.length);
    elementsRelative.forEach((el, index) => {
      console.log(`Element ${index} to save:`, {
        id: el.id,
        type: el.type,
        pageIndex: el.pageIndex,
        x: el.x + '%',
        y: el.y + '%',
        width: el.width + '%',
        height: el.height + '%',
        textContent: el.textContent
      });
    });

    setSaving(true);
    try {
      // CRITICAL FIX: Handle deletions properly
      const currentResponse = await axios.get(`${API_BASE_URL}/templates/${template._id}/elements`, {
        withCredentials: true,
      });
      const currentElements = currentResponse.data;
      console.log('Current elements in DB:', currentElements.length);

      // Find elements to delete (exist in DB but not in current elements array)
      const elementsToDelete = currentElements.filter((dbEl: any) =>
        !elementsRelative.some(el => el.id === dbEl.id)
      );
      console.log('Elements to delete:', elementsToDelete.length);

      // Delete removed elements
      const deletePromises = elementsToDelete.map(async (element: any) => {
        console.log('Deleting element:', element.id);
        return await axios.delete(
          `${API_BASE_URL}/templates/${template._id}/elements/${element.id}`,
          { withCredentials: true }
        );
      });

      // Sauvegarder tous les éléments du template
      const savePromises = elementsRelative.map(async (element) => {
        if (element.id.startsWith('temp_')) {
          console.log('Creating new element:', element.id);
          // Nouvel élément à créer
          return await axios.post(
            `${API_BASE_URL}/templates/${template._id}/elements`,
            element,
            { withCredentials: true }
          );
        } else {
          console.log('Updating existing element:', element.id);
          // Élément existant à mettre à jour
          return await axios.put(
            `${API_BASE_URL}/templates/${template._id}/elements/${element.id}`,
            element,
            { withCredentials: true }
          );
        }
      });

      console.log('Executing delete promises...');
      await Promise.all(deletePromises);
      console.log('Executing save promises...');
      const results = await Promise.all(savePromises);
      console.log('Save results:', results);

      // Recharger les éléments pour obtenir les IDs réels
      console.log('Reloading elements after save...');
      await loadElements(template._id);

      console.log('Éléments sauvegardés avec succès!');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue lors de la sauvegarde';
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    await handleSave();
    router.push('/admin/templates');
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10);
    const maxPage = actualPageCount || template?.pageCount || 1;
    if (!isNaN(page) && page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  };

  const handlePageCountChange = (count: number) => {
    setActualPageCount(count);
    if (currentPage > count) {
      setCurrentPage(1);
    }
  };

  const handleDimensionsChange = (dimensions: { width: number; height: number }) => {
    console.log('handleDimensionsChange: dimensions rendues:', dimensions);
    setRenderedPdfDimensions(dimensions);
    
    // Ajuster automatiquement le zoom si nécessaire pour s'adapter à la largeur
    if (containerRef.current && dimensions.width > containerRef.current.clientWidth) {
      const newZoom = containerRef.current.clientWidth / dimensions.width;
      const clampedZoom = Math.max(0.1, Math.min(2, newZoom));
      setZoom(clampedZoom);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleElementSelect = (element: EditorElement) => {
    setSelectedElement(element);
  };

  // ⚠️ CORRECTION : Cette fonction reçoit et envoie des coordonnées RELATIVES (0-100%)
  const handleElementUpdate = useCallback((updatedElement: EditorElement) => {
    console.log('handleElementUpdate: élément mis à jour (coordonnées relatives):', {
      id: updatedElement.id,
      x: updatedElement.x + '%',
      y: updatedElement.y + '%',
      width: updatedElement.width + '%',
      height: updatedElement.height + '%',
      fontSize: updatedElement.fontSize,
      color: updatedElement.color,
      backgroundColor: updatedElement.backgroundColor,
      alignment: updatedElement.alignment,
      fontStyle: updatedElement.fontStyle,
      googleFont: updatedElement.googleFont
    });

    setElementsRelative(prev =>
      prev.map(el => (el.id === updatedElement.id ? updatedElement : el))
    );

    if (selectedElement?.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  }, [selectedElement]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (document.activeElement && (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      (document.activeElement as HTMLElement).contentEditable === 'true'
    )) {
      return;
    }

    if (!selectedElement) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        if (selectedElement.type === 'text') {
          if (selectedElement.textContent && selectedElement.textContent.trim() !== '') {
            handleElementUpdate({
              ...selectedElement,
              textContent: ''
            });
          } else {
            handleDelete();
          }
        } else {
          handleDelete();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedElement(null);
        break;
      case 't':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleAddText();
        }
        break;
      case 'i':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleAddImage();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSave();
        }
        break;
      
      // Déplacement au clavier en pourcentages relatifs
      case 'ArrowUp':
        e.preventDefault();
        if (originalPdfDimensions) {
          const step = 0.5; // Déplacement de 0.5%
          const newY = Math.max(0, selectedElement.y - step);
          handleElementUpdate({
            ...selectedElement,
            y: newY
          });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (originalPdfDimensions) {
          const step = 0.5; // Déplacement de 0.5%
          const newY = Math.min(100 - selectedElement.height, selectedElement.y + step);
          handleElementUpdate({
            ...selectedElement,
            y: newY
          });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (originalPdfDimensions) {
          const step = 0.5; // Déplacement de 0.5%
          const newX = Math.max(0, selectedElement.x - step);
          handleElementUpdate({
            ...selectedElement,
            x: newX
          });
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (originalPdfDimensions) {
          const step = 0.5; // Déplacement de 0.5%
          const newX = Math.min(100 - selectedElement.width, selectedElement.x + step);
          handleElementUpdate({
            ...selectedElement,
            x: newX
          });
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Template non trouvé</p>
          <Button onClick={() => router.push('/admin/templates')} className="mt-4">
            Retour aux templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Barre d'outils */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4" role="banner">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Éditeur - {template.title}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({elementsRelative.length} élément{elementsRelative.length !== 1 ? 's' : ''})
            </span>
            <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              Page {currentPage} / {actualPageCount || template.pageCount}
            </div>
          </div>

          <nav className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Outils d'édition">
            <Button
               onClick={handleAddText}
               variant="outline"
               size="sm"
               aria-label="Ajouter un élément texte"
               title="Ajouter un nouveau champ texte (Ctrl+T)"
             >
               ➕ Texte
             </Button>
             <Button
               onClick={handleAddImage}
               variant="outline"
               size="sm"
               aria-label="Ajouter un élément image"
               title="Ajouter une nouvelle zone image (Ctrl+I)"
             >
               🖼️ Image
             </Button>
            
            <Button
               onClick={handleDelete}
               variant="outline"
               size="sm"
               disabled={!selectedElement}
               aria-label="Supprimer l'élément sélectionné"
               title="Supprimer l'élément sélectionné (Suppr)"
             >
               🗑️ Supprimer
             </Button>
            
            <Button
              onClick={handleSave}
              variant="default"
              size="sm"
              disabled={saving}
              aria-label="Sauvegarder tous les éléments"
              title="Sauvegarder tous les éléments (Ctrl+S)"
            >
              💾 {saving ? 'Saving...' : 'Save page'}
            </Button>

            <Button
              onClick={handleSaveTemplate}
              variant="default"
              size="sm"
              disabled={saving}
              aria-label="Sauvegarder le template"
              title="Sauvegarder le template et retourner à la liste"
            >
              💾 {saving ? 'Saving template...' : 'Save template'}
            </Button>

            <Button
              onClick={() => setShowGuides(!showGuides)}
              variant="outline"
              size="sm"
              aria-label={showGuides ? 'Masquer les guides' : 'Afficher les guides'}
            >
              {showGuides ? 'Masquer guides' : 'Afficher guides'}
            </Button>

            <nav className="flex items-center gap-2" role="navigation" aria-label="Navigation des pages">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                aria-label="Page précédente"
              >
                Précédent
              </Button>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={actualPageCount || template.pageCount}
                  value={currentPage}
                  onChange={handlePageInputChange}
                  className="w-16 h-8 text-center"
                  aria-label="Numéro de page"
                />
                <span className="text-sm">
                  / {actualPageCount || template.pageCount}
                </span>
              </div>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                variant="outline"
                size="sm"
                disabled={currentPage >= (actualPageCount || template.pageCount)}
                aria-label="Page suivante"
              >
                Suivant
              </Button>
            </nav>
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main
        className="flex flex-1 overflow-hidden"
        role="main"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Panneau latéral gauche - Éléments */}
        <aside
          className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden md:block"
          role="complementary"
          aria-label="Liste des éléments"
        >
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Éléments de la page {currentPage}
          </h2>

          <div className="space-y-2" role="list">
            {elementsRelative
              .filter(el => el.pageIndex === currentPage - 1)
              .map(element => (
                <Card
                  key={`${element.id}_${element.pageIndex}_${element.x}_${element.y}`}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedElement?.id === element.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleElementSelect(element)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleElementSelect(element);
                    }
                  }}
                  aria-label={`Élément ${element.type === 'text' ? 'texte' : 'image'}: ${element.type === 'text' ? element.textContent : 'Image'}`}
                  aria-selected={selectedElement?.id === element.id}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {element.type === 'text' ? 'Texte' : 'Image'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {element.type === 'text' ? element.textContent : 'Image'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400" aria-label={`Position: ${element.x}%, ${element.y}%`}>
                      {element.x.toFixed(1)}%, {element.y.toFixed(1)}%
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </aside>

        {/* Conteneur PDF */}
        <section
          className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-100 dark:bg-gray-800"
          role="region"
          aria-label="Aperçu du PDF"
        >
          <div ref={containerRef} className="relative w-full max-w-full h-full flex items-center justify-center">
            {template?.pdfPath && (
              <div
                className="relative w-full"
                style={{
                  height: renderedPdfDimensions?.height || 'auto'
                }}
              >
                <PDFViewer
                  pdfUrl={`${API_BASE_URL}/uploads/${template.pdfPath}`}
                  currentPage={currentPage}
                  zoom={zoom}
                  fitToWidth={true}
                  onPageCountChange={handlePageCountChange}
                  onDimensionsChange={handleDimensionsChange}
                  onZoomChange={setZoom}
                  className="shadow-lg"
                />

                {/* Guides d'alignement */}
                {showGuides && renderedPdfDimensions && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Lignes de grille */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: Math.floor(renderedPdfDimensions.width / 50) + 1 }, (_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-blue-300"
                          style={{ left: `${i * 50}px` }}
                        />
                      ))}
                      {Array.from({ length: Math.floor(renderedPdfDimensions.height / 50) + 1 }, (_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute left-0 right-0 h-px bg-blue-300"
                          style={{ top: `${i * 50}px` }}
                        />
                      ))}
                    </div>
                    {/* Lignes centrales */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400 opacity-30 transform -translate-x-px" />
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-red-400 opacity-30 transform -translate-y-px" />
                  </div>
                )}

                {/* Overlay des éléments avec drag & resize */}
                {originalPdfDimensions && (
                  <EditorElementOverlay
                    elements={elementsRelative.filter(el => el.pageIndex === currentPage - 1)}
                    selectedElement={selectedElement}
                    onSelect={handleElementSelect}
                    onUpdate={handleElementUpdate}
                    dimensions={renderedPdfDimensions}
                    originalPdfDimensions={originalPdfDimensions}
                    zoom={zoom}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Panneau latéral droit - Propriétés */}
        <aside
          className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto hidden lg:block"
          role="complementary"
          aria-label="Propriétés de l'élément"
        >
          {/* Section Variables */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Variables par défaut
            </h3>
            <div className="space-y-3">
              {(() => {
                // Collecter toutes les variables de tous les éléments texte
                const allVariables = new Set<string>();
                elementsRelative.forEach(element => {
                  if (element.type === 'text' && element.textContent) {
                    const variables = detectVariables(element.textContent);
                    variables.forEach(v => allVariables.add(v));
                  }
                });

                const variablesArray = Array.from(allVariables);
                return variablesArray.length > 0 ? (
                  variablesArray.map(variableName => (
                    <div key={variableName} className="space-y-2">
                      <Label htmlFor={`var-${variableName}`} className="text-sm font-medium">
                        {variableName}
                      </Label>
                      <Input
                        id={`var-${variableName}`}
                        type="text"
                        value={defaultValues[variableName] || ''}
                        onChange={(e) => updateDefaultValue(variableName, e.target.value)}
                        placeholder={`Valeur par défaut pour ${variableName}`}
                        className="w-full"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucune variable détectée dans les éléments texte.
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Propriétés de l'élément sélectionné */}
          {template && originalPdfDimensions && (
            <ElementPropertiesPanel
              element={selectedElement}
              templateId={template._id}
              templateDimensions={originalPdfDimensions}
              currentDisplayDimensions={renderedPdfDimensions} // ⚠️ NOUVEAU : Passer les dimensions d'affichage
              onUpdate={handleElementUpdate}
            />
          )}
        </aside>
      </main>
    </div>
  );
}