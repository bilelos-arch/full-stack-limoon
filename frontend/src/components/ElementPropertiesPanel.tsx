//frontend/src/components/ElementPropertiesPanel.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import googleFonts from '@/data/googleFonts.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

interface ElementPropertiesPanelProps {
  element: EditorElement | null;
  templateId: string;
  templateDimensions: { width: number; height: number }; // Dimensions ORIGINALES du PDF
  currentDisplayDimensions?: { width: number; height: number } | null; // ⚠️ CORRECTION : Ajout de | null
  onUpdate: (updatedElement: EditorElement) => void;
}

export default function ElementPropertiesPanel({
  element,
  templateId,
  templateDimensions,
  currentDisplayDimensions,
  onUpdate
}: ElementPropertiesPanelProps) {
  const [localElement, setLocalElement] = useState<EditorElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalElement(element);
  }, [element]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ⚠️ CORRECTION : Gestion du cas null
  const getCurrentScale = useCallback(() => {
    if (!currentDisplayDimensions) return { scaleX: 1, scaleY: 1 };
    
    const scaleX = currentDisplayDimensions.width / templateDimensions.width;
    const scaleY = currentDisplayDimensions.height / templateDimensions.height;
    
    return { scaleX, scaleY };
  }, [currentDisplayDimensions, templateDimensions]);

  const debouncedSave = useCallback(async (elementId: string, updatedElement: EditorElement) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await axios.put(
          `${API_BASE_URL}/templates/${templateId}/elements/${elementId}`,
          updatedElement,
          { withCredentials: true }
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [templateId]);

  const handleFieldChange = useCallback(async (field: keyof EditorElement, value: any) => {
    if (!localElement) return;

    const updatedElement = { ...localElement, [field]: value };
    setLocalElement(updatedElement);
    onUpdate(updatedElement);

    // Sauvegarde automatique seulement si c'est un élément existant (pas temporaire)
    const elementId = localElement.id;
    if (!elementId.startsWith('temp_')) {
      debouncedSave(elementId, updatedElement);
    }
  }, [localElement, onUpdate, debouncedSave]);

  const validatePercentage = (value: string, min: number = 0, max: number = 100): number => {
    const num = parseFloat(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  const validateAndUpdateField = (field: keyof EditorElement, value: any) => {
    const errors: {[key: string]: string} = {};

    // Validation des champs de position/dimension (pourcentages)
    if (field === 'x' || field === 'y' || field === 'width' || field === 'height') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        errors[field] = 'Doit être un pourcentage entre 0 et 100';
      } else {
        // Avertissements de débordement (mais pas bloquants)
        if (field === 'x' && localElement && (numValue + localElement.width) > 100) {
          errors[field] = `⚠️ L'élément dépasse la largeur de la page (x + width = ${(numValue + localElement.width).toFixed(1)}%)`;
        }
        if (field === 'y' && localElement && (numValue + localElement.height) > 100) {
          errors[field] = `⚠️ L'élément dépasse la hauteur de la page (y + height = ${(numValue + localElement.height).toFixed(1)}%)`;
        }
        if (field === 'width' && localElement && (localElement.x + numValue) > 100) {
          errors[field] = `⚠️ L'élément dépasse la largeur de la page (x + width = ${(localElement.x + numValue).toFixed(1)}%)`;
        }
        if (field === 'height' && localElement && (localElement.y + numValue) > 100) {
          errors[field] = `⚠️ L'élément dépasse la hauteur de la page (y + height = ${(localElement.y + numValue).toFixed(1)}%)`;
        }
      }
    }

    if (field === 'color' && !/^#[0-9A-F]{6}$/i.test(value)) {
      errors[field] = 'Format de couleur invalide (#RRGGBB)';
    }

    if (field === 'variableName' && value && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      errors[field] = 'Le nom doit commencer par une lettre ou _ et contenir uniquement des lettres, chiffres et _';
    }

    setValidationErrors(prev => ({ ...prev, [field]: errors[field] || '' }));

    // On bloque seulement les erreurs de format, pas les avertissements de débordement
    const hasBlockingErrors = Object.keys(errors).some(key => 
      !errors[key].includes('⚠️') && errors[key] !== ''
    );

    if (!hasBlockingErrors) {
      handleFieldChange(field, value);
    }
  };

  const insertVariable = (variable: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + `(${variable})` + text.substring(end);

    handleFieldChange('textContent', newText);

    // Restaurer la position du curseur après l'insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + `(${variable})`.length, start + `(${variable})`.length);
    }, 0);
  };

  const setFullWidth = () => {
    if (!localElement) return;
    handleFieldChange('width', 100);
  };

  const setFullHeight = () => {
    if (!localElement) return;
    handleFieldChange('height', 100);
  };

  const setFullPage = () => {
    if (!localElement) return;
    handleFieldChange('x', 0);
    handleFieldChange('y', 0);
    handleFieldChange('width', 100);
    handleFieldChange('height', 100);
  };

  if (!localElement) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>Sélectionnez un élément pour modifier ses propriétés</p>
        <p className="text-xs mt-2 italic">
          Les éléments s'adaptent automatiquement à la taille d'affichage
        </p>
      </div>
    );
  }

  // ⚠️ CORRECTION : Gestion du cas null
  const { scaleX, scaleY } = getCurrentScale();
  const isScaled = scaleX !== 1 || scaleY !== 1;

  // Afficher l'état de sauvegarde
  const isTempElement = localElement.id?.startsWith('temp_') || false;
  
  if (isTempElement) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Propriétés
          </h2>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            ⚠️ Nouvel élément - Utiliser "Sauvegarder" pour créer
          </p>
        </div>
        
        {/* Indicateur d'échelle */}
        {isScaled && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              📐 Échelle: {scaleX.toFixed(2)}x (affichage adaptatif actif)
            </p>
          </div>
        )}

        {/* Affichage des coordonnées en pourcentages */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          x: {localElement.x.toFixed(1)}%, y: {localElement.y.toFixed(1)}%<br/>
          w: {localElement.width.toFixed(1)}%, h: {localElement.height.toFixed(1)}%
        </div>

        {/* Boutons de taille prédéfinie */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={setFullWidth}
            title="100% de largeur"
          >
            📏 100% L
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setFullHeight}
            title="100% de hauteur"
          >
            📐 100% H
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setFullPage}
            title="Pleine page"
          >
            📄 Pleine page
          </Button>
        </div>

        {/* Position et dimensions en pourcentages */}
        <fieldset className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="x">Position X (%)</Label>
            <Input
              id="x"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={localElement.x}
              onChange={(e) => validateAndUpdateField('x', validatePercentage(e.target.value))}
              className={validationErrors.x ? 'border-yellow-500' : ''}
            />
            {validationErrors.x && (
              <p className={`text-xs mt-1 ${validationErrors.x.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
                {validationErrors.x}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="y">Position Y (%)</Label>
            <Input
              id="y"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={localElement.y}
              onChange={(e) => validateAndUpdateField('y', validatePercentage(e.target.value))}
              className={validationErrors.y ? 'border-yellow-500' : ''}
            />
            {validationErrors.y && (
              <p className={`text-xs mt-1 ${validationErrors.y.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
                {validationErrors.y}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="width">Largeur (%)</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={localElement.width}
              onChange={(e) => validateAndUpdateField('width', validatePercentage(e.target.value, 0.1))}
              className={validationErrors.width ? 'border-yellow-500' : ''}
            />
            {validationErrors.width && (
              <p className={`text-xs mt-1 ${validationErrors.width.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
                {validationErrors.width}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="height">Hauteur (%)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={localElement.height}
              onChange={(e) => validateAndUpdateField('height', validatePercentage(e.target.value, 0.1))}
              className={validationErrors.height ? 'border-yellow-500' : ''}
            />
            {validationErrors.height && (
              <p className={`text-xs mt-1 ${validationErrors.height.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
                {validationErrors.height}
              </p>
            )}
          </div>
        </fieldset>

        {localElement.type === 'text' && (
          <fieldset className="space-y-4">
            <div>
              <Label htmlFor="textContent">Contenu</Label>
              <Textarea
                ref={textAreaRef}
                id="textContent"
                value={localElement.textContent || ''}
                onChange={(e) => handleFieldChange('textContent', e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => insertVariable('nom')}>
                  + Nom
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertVariable('age')}>
                  + Âge
                </Button>
                <Button variant="outline" size="sm" onClick={() => insertVariable('date')}>
                  + Date
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="fontSize">Taille de police</Label>
              <Input
                id="fontSize"
                type="number"
                min="8"
                max="72"
                step="1"
                value={localElement.fontSize || 12}
                onChange={(e) => handleFieldChange('fontSize', parseInt(e.target.value) || 12)}
              />
            </div>

            <div>
              <Label>Styles de police</Label>
              <div className="flex gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bold"
                    checked={localElement.fontStyle?.bold || false}
                    onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                      ...localElement.fontStyle,
                      bold: checked
                    })}
                  />
                  <Label htmlFor="bold" className="text-sm">Gras</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="italic"
                    checked={localElement.fontStyle?.italic || false}
                    onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                      ...localElement.fontStyle,
                      italic: checked
                    })}
                  />
                  <Label htmlFor="italic" className="text-sm">Italique</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="underline"
                    checked={localElement.fontStyle?.underline || false}
                    onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                      ...localElement.fontStyle,
                      underline: checked
                    })}
                  />
                  <Label htmlFor="underline" className="text-sm">Souligné</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="googleFont">Police Google Fonts</Label>
              <Select
                value={localElement.googleFont || ''}
                onValueChange={(value) => handleFieldChange('googleFont', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une police Google" />
                </SelectTrigger>
                <SelectContent>
                  {googleFonts.map((font, index) => (
                    <SelectItem key={index} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="color"
                value={localElement.color || '#000000'}
                onChange={(e) => {
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    handleFieldChange('color', e.target.value);
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="backgroundColor">Couleur de fond</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={localElement.backgroundColor || '#ffffff'}
                onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="alignment">Alignement</Label>
              <Select
                value={localElement.alignment || 'left'}
                onValueChange={(value: 'left' | 'center' | 'right') => handleFieldChange('alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </fieldset>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Propriétés
        </h2>
        <div className="flex flex-col items-end gap-1">
          {saving && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Sauvegarde...
            </span>
          )}
        </div>
      </div>

      {/* Indicateur d'échelle */}
      {isScaled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            📐 Échelle: {scaleX.toFixed(2)}x (affichage adaptatif actif)
          </p>
        </div>
      )}

      {/* Affichage des coordonnées en pourcentages */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        x: {localElement.x.toFixed(1)}%, y: {localElement.y.toFixed(1)}%<br/>
        w: {localElement.width.toFixed(1)}%, h: {localElement.height.toFixed(1)}%
      </div>

      {/* Boutons de taille prédéfinie */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={setFullWidth}
          title="100% de largeur"
        >
          📏 100% L
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setFullHeight}
          title="100% de hauteur"
        >
          📐 100% H
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={setFullPage}
          title="Pleine page"
        >
          📄 Pleine page
        </Button>
      </div>

      {/* Position et dimensions en pourcentages */}
      <fieldset className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="x">Position X (%)</Label>
          <Input
            id="x"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={localElement.x}
            onChange={(e) => validateAndUpdateField('x', validatePercentage(e.target.value))}
            className={validationErrors.x ? 'border-yellow-500' : ''}
          />
          {validationErrors.x && (
            <p className={`text-xs mt-1 ${validationErrors.x.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
              {validationErrors.x}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="y">Position Y (%)</Label>
          <Input
            id="y"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={localElement.y}
            onChange={(e) => validateAndUpdateField('y', validatePercentage(e.target.value))}
            className={validationErrors.y ? 'border-yellow-500' : ''}
          />
          {validationErrors.y && (
            <p className={`text-xs mt-1 ${validationErrors.y.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
              {validationErrors.y}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="width">Largeur (%)</Label>
          <Input
            id="width"
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={localElement.width}
            onChange={(e) => validateAndUpdateField('width', validatePercentage(e.target.value, 0.1))}
            className={validationErrors.width ? 'border-yellow-500' : ''}
          />
          {validationErrors.width && (
            <p className={`text-xs mt-1 ${validationErrors.width.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
              {validationErrors.width}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="height">Hauteur (%)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            value={localElement.height}
            onChange={(e) => validateAndUpdateField('height', validatePercentage(e.target.value, 0.1))}
            className={validationErrors.height ? 'border-yellow-500' : ''}
          />
          {validationErrors.height && (
            <p className={`text-xs mt-1 ${validationErrors.height.includes('⚠️') ? 'text-yellow-600' : 'text-red-500'}`}>
              {validationErrors.height}
            </p>
          )}
        </div>
      </fieldset>

      {/* Propriétés spécifiques au texte */}
      {localElement.type === 'text' && (
        <fieldset className="space-y-4">
          <div>
            <Label htmlFor="textContent">Contenu</Label>
            <Textarea
              ref={textAreaRef}
              id="textContent"
              value={localElement.textContent || ''}
              onChange={(e) => handleFieldChange('textContent', e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => insertVariable('nom')}>
                + Nom
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertVariable('age')}>
                + Âge
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertVariable('date')}>
                + Date
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="fontSize">Taille de police</Label>
            <Input
              id="fontSize"
              type="number"
              min="8"
              max="72"
              step="1"
              value={localElement.fontSize || 12}
              onChange={(e) => handleFieldChange('fontSize', parseInt(e.target.value) || 12)}
            />
          </div>

          <div>
            <Label>Styles de police</Label>
            <div className="flex gap-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bold"
                  checked={localElement.fontStyle?.bold || false}
                  onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                    ...localElement.fontStyle,
                    bold: checked
                  })}
                />
                <Label htmlFor="bold" className="text-sm">Gras</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="italic"
                  checked={localElement.fontStyle?.italic || false}
                  onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                    ...localElement.fontStyle,
                    italic: checked
                  })}
                />
                <Label htmlFor="italic" className="text-sm">Italique</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="underline"
                  checked={localElement.fontStyle?.underline || false}
                  onCheckedChange={(checked) => handleFieldChange('fontStyle', {
                    ...localElement.fontStyle,
                    underline: checked
                  })}
                />
                <Label htmlFor="underline" className="text-sm">Souligné</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="googleFont">Police Google Fonts</Label>
            <Select
              value={localElement.googleFont || ''}
              onValueChange={(value) => handleFieldChange('googleFont', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une police Google" />
              </SelectTrigger>
              <SelectContent>
                {googleFonts.map((font, index) => (
                  <SelectItem key={index} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color">Couleur</Label>
            <Input
              id="color"
              type="color"
              value={localElement.color || '#000000'}
              onChange={(e) => validateAndUpdateField('color', e.target.value)}
              className={validationErrors.color ? 'border-red-500' : ''}
            />
            {validationErrors.color && <p className="text-xs text-red-500 mt-1">{validationErrors.color}</p>}
          </div>

          <div>
            <Label htmlFor="backgroundColor">Couleur de fond</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={localElement.backgroundColor || '#ffffff'}
              onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="alignment">Alignement</Label>
            <Select
              value={localElement.alignment || 'left'}
              onValueChange={(value: 'left' | 'center' | 'right') => handleFieldChange('alignment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Gauche</SelectItem>
                <SelectItem value="center">Centre</SelectItem>
                <SelectItem value="right">Droite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </fieldset>
      )}

      {/* Propriétés spécifiques à l'image */}
      {localElement.type === 'image' && (
        <div>
          <Label htmlFor="variableName">Nom de variable</Label>
          <Input
            id="variableName"
            value={localElement.variableName || ''}
            onChange={(e) => validateAndUpdateField('variableName', e.target.value)}
            placeholder="Ex: hero_name"
            pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
            title="Le nom de variable doit commencer par une lettre ou un underscore et ne contenir que des lettres, chiffres et underscores"
            className={validationErrors.variableName ? 'border-red-500' : ''}
          />
          {validationErrors.variableName && <p className="text-xs text-red-500 mt-1">{validationErrors.variableName}</p>}
        </div>
      )}
    </div>
  );
}