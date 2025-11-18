'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook pour créer un focus trap dans les éléments focusables d'un conteneur
 * Améliore l'accessibilité en limitant la navigation clavier au contenu d'un modal ou d'un menu
 */
export const useFocusTrap = (isActive: boolean, onEscape?: () => void) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Récupérer tous les éléments focusables
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input[type="text"]:not([disabled])',
        'input[type="radio"]:not([disabled])',
        'input[type="checkbox"]:not([disabled])',
        'input[type="submit"]:not([disabled])',
        'input[type="button"]:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter(element => {
          // Vérifier que l'élément est visible
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus sur le premier élément
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Gérer la touche Escape
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Gérer Tab pour cycler dans les éléments focusables
      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = focusableElements.indexOf(activeElement);

        if (e.shiftKey) {
          // Shift + Tab (navigation vers l'arrière)
          if (activeElement === firstElement || currentIndex === -1) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab (navigation vers l'avant)
          if (activeElement === lastElement || currentIndex === -1) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    // Ajouter l'événement de clavier
    document.addEventListener('keydown', handleKeyDown);

    // Empêcher la propagation du clic à l'extérieur pour fermer automatiquement
    const handleClickOutside = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        if (onEscape) {
          onEscape();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Empêcher le scroll du body quand le trap est actif
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = originalOverflow;
    };
  }, [isActive, onEscape]);

  return containerRef;
};

/**
 * Hook simplifié pour les focus traps basiques
 */
export const useSimpleFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [isActive]);

  return containerRef;
};

export default useFocusTrap;