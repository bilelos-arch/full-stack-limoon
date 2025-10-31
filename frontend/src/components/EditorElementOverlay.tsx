//frontend/src/components/EditorElementOverlay.tsx
'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';

interface EditorElement {
  id: string;
  templateId: string;
  type: 'text' | 'image';
  pageIndex: number;
  x: number; // Pourcentage relatif (0-100) basé sur dimensions ORIGINALES
  y: number; // Pourcentage relatif (0-100) basé sur dimensions ORIGINALES
  width: number; // Pourcentage relatif (0-100) basé sur dimensions ORIGINALES
  height: number; // Pourcentage relatif (0-100) basé sur dimensions ORIGINALES
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

interface EditorElementOverlayProps {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  onSelect: (element: EditorElement) => void;
  onUpdate: (element: EditorElement) => void;
  dimensions?: {
    width: number;
    height: number;
  } | null;
  originalPdfDimensions?: {
    width: number;
    height: number;
  } | null;
  zoom?: number;
}

export default function EditorElementOverlay({
  elements,
  selectedElement,
  onSelect,
  onUpdate,
  dimensions,
  originalPdfDimensions,
  zoom = 1
}: EditorElementOverlayProps) {
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedElements = useMemo(() => {
    return elements.sort((a, b) => {
      // Trier pour que l'élément sélectionné soit rendu en dernier (au-dessus)
      if (a.id === selectedElement?.id) return 1;
      if (b.id === selectedElement?.id) return -1;
      return 0;
    });
  }, [elements, selectedElement]);

  // ⚠️ CORRECTION : Calcul du ratio d'échelle entre dimensions originales et affichées
  const getScaleRatio = useCallback(() => {
    if (!dimensions || !originalPdfDimensions) return { scaleX: 1, scaleY: 1 };
    
    const scaleX = dimensions.width / originalPdfDimensions.width;
    const scaleY = dimensions.height / originalPdfDimensions.height;
    
    return { scaleX, scaleY };
  }, [dimensions, originalPdfDimensions]);

  // ⚠️ CORRECTION : Conversion avec adaptation automatique à l'échelle d'affichage
  const getAbsolutePosition = useCallback((element: EditorElement) => {
    if (!dimensions || !originalPdfDimensions) return { x: 0, y: 0, width: 0, height: 0 };
    
    const { scaleX, scaleY } = getScaleRatio();
    
    // Conversion des coordonnées relatives (basées sur dimensions originales) en pixels d'affichage
    const absX = (element.x / 100) * originalPdfDimensions.width * scaleX;
    const absY = (element.y / 100) * originalPdfDimensions.height * scaleY;
    const absWidth = (element.width / 100) * originalPdfDimensions.width * scaleX;
    const absHeight = (element.height / 100) * originalPdfDimensions.height * scaleY;
    
    console.log(`Element ${element.id} scaling:`, {
      original: { x: element.x, y: element.y, width: element.width, height: element.height },
      scale: { scaleX, scaleY },
      display: { x: absX, y: absY, width: absWidth, height: absHeight },
      originalDims: originalPdfDimensions,
      displayDims: dimensions
    });
    
    return {
      x: absX,
      y: absY,
      width: absWidth,
      height: absHeight,
    };
  }, [dimensions, originalPdfDimensions, getScaleRatio]);

  const startEditing = useCallback((element: EditorElement) => {
    if (element.type === 'text') {
      setEditingElementId(element.id);
      setEditingText(element.textContent || '');
      // Focus the input after render
      setTimeout(() => {
        inputRef.current?.focus();
        // Position cursor at the end instead of selecting all text
        const length = (element.textContent || '').length;
        inputRef.current?.setSelectionRange(length, length);
      }, 0);
    }
  }, []);

  const stopEditing = useCallback(() => {
    if (editingElementId) {
      const element = elements.find(el => el.id === editingElementId);
      if (element && element.type === 'text') {
        onUpdate({
          ...element,
          textContent: editingText
        });
      }
    }
    setEditingElementId(null);
    setEditingText('');
  }, [editingElementId, editingText, elements, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingElementId(null);
      setEditingText('');
    }
  }, [stopEditing]);

  if (!dimensions || !originalPdfDimensions) {
    return null;
  }

  const { scaleX, scaleY } = getScaleRatio();

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        pointerEvents: 'auto',
      }}
    >
      {sortedElements.map(el => {
        const absPos = getAbsolutePosition(el);
        
        return (
          <Rnd
            key={`${el.id}_${el.pageIndex}_${el.x}_${el.y}`}
            bounds="parent"
            size={{ width: absPos.width, height: absPos.height }}
            position={{ x: absPos.x, y: absPos.y }}
            disableDragging={editingElementId === el.id}
            onDragStop={(e, d) => {
              console.log(`=== ON DRAG STOP ===`);
              console.log(`Element ${el.id}, drag position (${d.x}px, ${d.y}px)`);
              console.log(`Original PDF dimensions: (${originalPdfDimensions.width}px, ${originalPdfDimensions.height}px)`);
              console.log(`Display dimensions: (${dimensions.width}px, ${dimensions.height}px)`);
              console.log(`Scale ratio: (${scaleX}, ${scaleY})`);

              // ⚠️ CORRECTION : Conversion inverse avec prise en compte de l'échelle
              // On convertit les pixels d'affichage en pourcentages basés sur les dimensions ORIGINALES
              const relativeX = (d.x / scaleX / originalPdfDimensions.width) * 100;
              const relativeY = (d.y / scaleY / originalPdfDimensions.height) * 100;

              // Validation des limites (0-100%)
              const clampedX = Math.max(0, Math.min(relativeX, 100));
              const clampedY = Math.max(0, Math.min(relativeY, 100));

              console.log(`onDragStop: display (${d.x}px, ${d.y}px) -> original (${relativeX}%, ${relativeY}%) -> clamped (${clampedX}%, ${clampedY}%)`);

              onUpdate({
                ...el,
                x: clampedX,
                y: clampedY
              });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              console.log(`=== ON RESIZE STOP ===`);
              console.log(`Element ${el.id}, position (${position.x}px, ${position.y}px), ref size (${ref.offsetWidth}px, ${ref.offsetHeight}px)`);
              console.log(`Scale ratio: (${scaleX}, ${scaleY})`);

              // Utiliser les dimensions du ref directement
              const newWidth = ref.offsetWidth;
              const newHeight = ref.offsetHeight;

              // ⚠️ CORRECTION : Conversion inverse avec prise en compte de l'échelle
              const relativeX = (position.x / scaleX / originalPdfDimensions.width) * 100;
              const relativeY = (position.y / scaleY / originalPdfDimensions.height) * 100;
              const relativeWidth = (newWidth / scaleX / originalPdfDimensions.width) * 100;
              const relativeHeight = (newHeight / scaleY / originalPdfDimensions.height) * 100;

              // Validation des limites (0-100%)
              const clampedX = Math.max(0, Math.min(relativeX, 100));
              const clampedY = Math.max(0, Math.min(relativeY, 100));
              const clampedWidth = Math.max(0.1, Math.min(relativeWidth, 100));
              const clampedHeight = Math.max(0.1, Math.min(relativeHeight, 100));

              console.log(`onResizeStop: display (${position.x}px, ${position.y}px, ${newWidth}px, ${newHeight}px) -> original (${relativeX}%, ${relativeY}%, ${relativeWidth}%, ${relativeHeight}%) -> clamped (${clampedX}%, ${clampedY}%, ${clampedWidth}%, ${clampedHeight}%)`);

              const updatedElement = {
                ...el,
                x: clampedX,
                y: clampedY,
                width: clampedWidth,
                height: clampedHeight
              };

              onUpdate(updatedElement);
            }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (editingElementId === el.id) {
                // Already editing, don't change selection
                return;
              }
              onSelect(el);
            }}
            onDoubleClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (el.type === 'text') {
                startEditing(el);
              }
            }}
            style={{
              border: selectedElement?.id === el.id ? '2px solid #3b82f6' : '1px dashed #6b7280',
              background: el.backgroundColor || 'transparent',
              cursor: editingElementId === el.id ? 'default' : 'move',
              zIndex: selectedElement?.id === el.id ? 20 : 10,
              boxShadow: selectedElement?.id === el.id ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none',
              transition: 'all 0.2s ease-in-out',
            }}
            enableResizing={editingElementId === el.id ? false : {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true
            }}
            minWidth={10}
            minHeight={10}
            // ⚠️ CORRECTION : Limites basées sur les dimensions d'affichage
            maxWidth={dimensions.width}
            maxHeight={dimensions.height}
            resizeHandleStyles={{
              top: { cursor: 'n-resize' },
              right: { cursor: 'e-resize' },
              bottom: { cursor: 's-resize' },
              left: { cursor: 'w-resize' },
              topRight: { cursor: 'ne-resize' },
              bottomRight: { cursor: 'se-resize' },
              bottomLeft: { cursor: 'sw-resize' },
              topLeft: { cursor: 'nw-resize' }
            }}
          >
            <div className="w-full h-full flex items-start justify-center relative">
              {el.type === 'text' && editingElementId === el.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={stopEditing}
                  style={{
                    fontFamily: el.googleFont || el.font || 'Arial, sans-serif',
                    color: el.color || '#000000',
                    textAlign: el.alignment || 'left',
                    verticalAlign: 'top',
                    fontSize: (el.fontSize || 14) * Math.max(scaleX, scaleY), // Adaptation de la taille de police à l'échelle
                    fontWeight: el.fontStyle?.bold ? 'bold' : 'normal',
                    fontStyle: el.fontStyle?.italic ? 'italic' : 'normal',
                    textDecoration: el.fontStyle?.underline ? 'underline' : (el.fontStyle?.strikethrough ? 'line-through' : 'none'),
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    background: el.backgroundColor ? el.backgroundColor : 'rgba(255,255,255,0.95)',
                    padding: '2px',
                    boxSizing: 'border-box'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : el.type === 'text' && (
                <span
                  style={{
                    fontFamily: el.googleFont || el.font || 'Arial, sans-serif',
                    color: el.color || '#000000',
                    textAlign: el.alignment || 'left',
                    verticalAlign: 'top',
                    fontSize: (el.fontSize || 14) * Math.max(scaleX, scaleY), // Adaptation de la taille de police à l'échelle
                    fontWeight: el.fontStyle?.bold ? 'bold' : 'normal',
                    fontStyle: el.fontStyle?.italic ? 'italic' : 'normal',
                    textDecoration: el.fontStyle?.underline ? 'underline' : (el.fontStyle?.strikethrough ? 'line-through' : 'none'),
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    padding: '2px',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    backgroundColor: el.backgroundColor || 'transparent'
                  }}
                  title={el.textContent || 'Nouveau texte'}
                >
                  {el.textContent || 'Nouveau texte'}
                </span>
              )}
              {el.type === 'image' && (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-600">
                  <div className="text-center">
                    <svg 
                      className="w-6 h-6 mx-auto mb-1 text-blue-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{
                        width: `${20 / Math.max(scaleX, scaleY)}px`,
                        height: `${20 / Math.max(scaleX, scaleY)}px`
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span 
                      className="text-blue-700 dark:text-blue-300 font-medium"
                      style={{
                        fontSize: `${10 / Math.max(scaleX, scaleY)}px`
                      }}
                    >
                      Zone Image
                    </span>
                  </div>
                </div>
              )}
              {/* Indicateur de sélection */}
              {selectedElement?.id === el.id && (
                <div 
                  className="absolute -top-1 -right-1 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                  style={{
                    width: `${12 / Math.max(scaleX, scaleY)}px`,
                    height: `${12 / Math.max(scaleX, scaleY)}px`
                  }}
                >
                  <svg 
                    className="text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{
                      width: `${8 / Math.max(scaleX, scaleY)}px`,
                      height: `${8 / Math.max(scaleX, scaleY)}px`
                    }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </Rnd>
        );
      })}
    </div>
  );
}