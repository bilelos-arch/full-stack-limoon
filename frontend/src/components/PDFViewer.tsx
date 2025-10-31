//frontend/src/components/PDFViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

// Lazy import pour éviter les erreurs SSR
let pdfjsLib: any = null;

interface PDFViewerProps {
  pdfUrl: string;
  currentPage: number;
  zoom: number;
  fitToWidth?: boolean;
  onPageCountChange?: (count: number) => void;
  onDimensionsChange?: (dimensions: { width: number; height: number; x?: number; y?: number }) => void;
  onZoomChange?: (zoom: number) => void; // Callback pour notifier les changements de zoom
  className?: string;
}

export default function PDFViewer({
  pdfUrl,
  currentPage,
  zoom,
  fitToWidth = false,
  onPageCountChange,
  onDimensionsChange,
  onZoomChange,
  className = ''
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const renderTaskRef = useRef<any>(null);
  const dimensionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRenderingRef = useRef<boolean>(false);

  // Charger pdfjs-dist dynamiquement
  const loadPdfJs = async () => {
    if (!pdfjsLib) {
      try {
        pdfjsLib = await import('pdfjs-dist');
        // Configuration du worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
      } catch (err) {
        console.error('Erreur lors du chargement de pdfjs-dist:', err);
        throw err;
      }
    }
    return pdfjsLib;
  };

  // Charger le PDF
  const loadPDF = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      const pdfjs = await loadPdfJs();
      
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      console.log(`PDF chargé: ${pdf.numPages} pages`);
      setPdfDocument(pdf);
      onPageCountChange?.(pdf.numPages);
    } catch (err) {
      console.error('Erreur lors du chargement du PDF:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Rendre la page
  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current || currentPage < 1 || currentPage > pdfDocument.numPages) {
      console.log('renderPage: conditions non remplies, annulation');
      return;
    }

    // Empêcher les appels récursifs pendant le rendu
    if (isRenderingRef.current) {
      console.log('renderPage: rendu déjà en cours, annulation');
      return;
    }

    console.log(`renderPage: début rendu page ${currentPage}, zoom: ${zoom}, fitToWidth: ${fitToWidth}`);
    // Supprimé les logs DEBUG trop verbeux pour éviter la surcharge

    try {
      isRenderingRef.current = true;

      // Annuler le rendu en cours s'il existe
      if (renderTaskRef.current) {
        console.log('renderPage: annulation du rendu en cours');
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Canvas non disponible');
        return;
      }

      const page = await pdfDocument.getPage(currentPage);

      // Calculer les dimensions avec zoom
      let viewport = page.getViewport({ scale: zoom });

      // Si fitToWidth est activé, ajuster le zoom pour s'adapter à la largeur du conteneur
      let actualZoom = zoom;
      if (fitToWidth && canvas.parentElement) {
        const containerWidth = canvas.parentElement.clientWidth;
        // Utiliser la largeur originale de la page pour le calcul
        const originalViewport = page.getViewport({ scale: 1 });
        actualZoom = containerWidth / originalViewport.width;
        viewport = page.getViewport({ scale: actualZoom });
        console.log(`renderPage: ajustement fitToWidth, scale: ${actualZoom}`);

        // Notifier le changement de zoom au parent UNIQUEMENT si nécessaire
        if (onZoomChange && Math.abs(actualZoom - zoom) > 0.001) {
          console.log('renderPage: appel onZoomChange avec:', actualZoom);
          onZoomChange(actualZoom);
        }
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      // Démarrer le rendu et sauvegarder la référence
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      console.log('renderPage: rendu démarré');

      await renderTask.promise;
      console.log('renderPage: rendu terminé avec succès');

      // Nettoyer l'ancien timeout
      if (dimensionsTimeoutRef.current) {
        clearTimeout(dimensionsTimeoutRef.current);
      }

      // Notifier les dimensions réelles du PDF rendu avec debouncing
      dimensionsTimeoutRef.current = setTimeout(() => {
        if (canvasRef.current && renderTaskRef.current === null) {
          const rect = canvasRef.current.getBoundingClientRect();
          onDimensionsChange?.({
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y
          });
          console.log('renderPage: dimensions notifiées');
        }
      }, 100);

    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Erreur lors du rendu de la page:', err);
        setError('Erreur lors du rendu de la page');
      } else {
        console.log('renderPage: rendu annulé');
      }
    } finally {
      renderTaskRef.current = null;
      isRenderingRef.current = false;
      console.log('renderPage: nettoyage terminé');
    }
  };

  // Effets
  useEffect(() => {
    if (pdfUrl) {
      loadPDF(pdfUrl);
    }
  }, [pdfUrl]);

  useEffect(() => {
    console.log('PDFViewer: useEffect déclenché pour renderPage - pdfDocument:', !!pdfDocument, 'currentPage:', currentPage, 'zoom:', zoom);
    renderPage();
  }, [pdfDocument, currentPage, zoom]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (dimensionsTimeoutRef.current) {
        clearTimeout(dimensionsTimeoutRef.current);
      }
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Erreur de chargement du PDF</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              if (pdfUrl) loadPDF(pdfUrl);
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto shadow-lg"
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: 'auto'
        }}
        aria-label={`Page ${currentPage} du PDF`}
      />
    </div>
  );
}