// Utilitaires optimisés pour la génération d'avatar DiceBear en temps réel
import { adventurer } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { AvatarConfig, ChildProfileForm } from "@/types/avatar";

/**
 * Options disponibles pour l'avatar Adventurer extraites du schéma DiceBear
 * @returns Record<string, string[]> - Options organisées par propriété
 */
export function getAdventurerOptions(): Record<string, string[]> {
  try {
    const metadata = adventurer.schema;
    const options: Record<string, string[]> = {};

    for (const [key, prop] of Object.entries(metadata.properties || {})) {
      if (!prop || typeof prop !== 'object') continue;
      
      const propObj = prop as any;
      if (propObj.type === 'array' && propObj.items) {
        const items = propObj.items;
        
        // Gestion des propriétés avec enum (eyebrows, eyes, glasses, hair, mouth, etc.)
        if (items.enum && Array.isArray(items.enum)) {
          options[key] = items.enum.filter((v: any): v is string => typeof v === 'string');
        }
        // Gestion des propriétés avec pattern (hairColor, skinColor) et valeurs par défaut
        else if (items.type === 'string' && items.pattern && propObj.default && Array.isArray(propObj.default)) {
          options[key] = propObj.default.filter((v: any): v is string => typeof v === 'string');
        }
        // Gestion des autres propriétés avec valeurs par défaut
        else if (propObj.default && Array.isArray(propObj.default)) {
          options[key] = propObj.default.filter((v: any): v is string => typeof v === 'string');
        }
      }
    }

    console.log('🔧 Options DiceBear extraites avec succès:', Object.keys(options).length, 'propriétés');
    Object.entries(options).forEach(([key, values]) => {
      console.log(`  - ${key}: ${values.length} options`);
    });

    return options;
  } catch (error) {
    console.error("❌ Erreur lors de l'extraction des options DiceBear:", error);
    return {};
  }
}

/**
 * Génère un avatar à partir d'une configuration optimisée pour les performances
 * @param config Configuration DiceBear
 * @param size Taille de l'avatar en pixels (défaut: 256)
 * @returns Promise<string> - Data URI de l'avatar généré
 */
export async function generateAvatarOptimized(config: any, size: number = 256): Promise<string> {
  try {
    // Validation et nettoyage de la configuration
    const validatedConfig = validateAndCleanConfig(config);
    
    // Génération de l'avatar avec DiceBear
    const avatar = createAvatar(adventurer, validatedConfig);
    
    // Génération du Data URI (version simple sans options)
    return avatar.toDataUri();
  } catch (error) {
    console.error("Erreur lors de la génération optimisée de l'avatar:", error);
    // Fallback avec configuration minimale
    const fallbackConfig: any = {
      backgroundColor: ['b6e3f4']
    };
    
    try {
      const avatar = createAvatar(adventurer, fallbackConfig);
      return avatar.toDataUri();
    } catch (fallbackError) {
      console.error("Erreur lors de la génération de fallback:", fallbackError);
      throw new Error("Impossible de générer l'avatar");
    }
  }
}

/**
 * Valide et nettoie la configuration DiceBear pour optimiser les performances
 * @param config Configuration brute
 * @returns any Configuration validée
 */
function validateAndCleanConfig(config: AvatarConfig): any {
  const cleanedConfig: any = {};
  
  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value) && value.length > 0) {
      // Filtrer les valeurs vides et dupliquer
      const validValues = Array.from(new Set(
        value.filter(v => typeof v === 'string' && v.trim() !== '')
      ));
      
      if (validValues.length > 0) {
        // Gestion spéciale pour la propriété base
        if (key === 'base' && validValues[0] !== 'default') {
          continue; // Ignorer les valeurs invalides pour base
        }
        cleanedConfig[key] = validValues;
      }
    }
  }
  
  // S'assurer qu'il y a toujours un fond
  if (!cleanedConfig.backgroundColor) {
    cleanedConfig.backgroundColor = ['b6e3f4'];
  }
  
  return cleanedConfig;
}

/**
 * Conversion optimisée de ChildProfileForm vers configuration DiceBear
 * @param profile Profil de l'enfant depuis l'interface utilisateur
 * @returns any Configuration DiceBear optimisée
 */
export function convertProfileToAvatarConfig(profile: ChildProfileForm): any {
  const config: any = {
    hair: [profile.hairType],
    hairColor: [profile.hairColor],
    skinColor: [profile.skinTone],
    eyes: [profile.eyes],
    eyebrows: [profile.eyebrows],
    mouth: [profile.mouth],
    earrings: [profile.earrings],
    glasses: [profile.glasses],
    features: [profile.features],
    backgroundColor: ['b6e3f4']
  };
  
  return validateAndCleanConfig(config);
}

/**
 * Utilitaire pour générer un avatar avec gestion des erreurs robuste
 * @param profile Profil de l'enfant
 * @param onProgress Callback pour indiquer le progrès (optionnel)
 * @returns Promise<string> - Data URI de l'avatar
 */
export async function generateAvatarWithProgress(
  profile: ChildProfileForm,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    onProgress?.(0.1); // Début de la génération
    
    const config = convertProfileToAvatarConfig(profile);
    onProgress?.(0.5); // Configuration prête
    
    const dataUri = await generateAvatarOptimized(config);
    onProgress?.(1.0); // Génération terminée
    
    return dataUri;
  } catch (error) {
    console.error("Erreur lors de la génération avec progrès:", error);
    throw error;
  }
}

/**
 * Hook pour debouncing des changements de configuration d'avatar
 * @param delay Délai en millisecondes (défaut: 300ms)
 * @returns Fonction de debounce
 */
export function createAvatarDebounce(delay: number = 300) {
  let timeoutId: NodeJS.Timeout;
  
  return function debounce<T extends any[]>(
    callback: (...args: T) => void,
    ...args: T
  ) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}
