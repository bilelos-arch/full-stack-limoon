// Types pour les paramètres d'avatar DiceBear
export interface AvatarConfig {
  base?: string[];
  earrings?: string[];
  earringsProbability?: number;
  eyebrows?: string[];
  eyes?: string[];
  features?: string[];
  featuresProbability?: number;
  glasses?: string[];
  glassesProbability?: number;
  hair?: string[];
  hairColor?: string[];
  hairProbability?: number;
  mouth?: string[];
  skinColor?: string[];
  backgroundColor?: string[];
  [key: string]: any; // Permet d'autres propriétés
}

// Options disponibles pour l'avatar (extraites du schema DiceBear réel)
export interface AvatarOptions {
  base: string[];
  earrings: string[];
  eyebrows: string[];
  eyes: string[];
  features: string[];
  glasses: string[];
  hair: string[];
  hairColor: string[];
  mouth: string[];
  skinColor: string[];
}

// Interface pour l'interface utilisateur (utilisant les vraies options DiceBear)
export interface ChildProfileForm {
  gender: string;
  hairType: string;
  hairColor: string;
  skinTone: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  earrings: string; // DiceBear earrings
  glasses: string; // DiceBear glasses style
  features: string; // DiceBear features
}

// Interface pour compatibilité avec le schema backend
export interface ChildProfileBackend {
  name?: string;
  age?: string;
  gender: string;
  mood?: string;
  hairType: string;
  hairColor: string;
  skinTone: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  glasses: boolean;
  glassesStyle: string;
  accessories: string;
  earrings?: string;
  features?: string;
}

// Mappage des couleurs de cheveux corrigé selon les vraies options DiceBear
export const HAIR_COLORS: { [key: string]: string } = {
  '181818': 'Noir',
  '6d4c41': 'Brun',
  'f5c842': 'Blond',
  'e67e22': 'Roux',
  'ff6b6b': 'Rose',
  '85c2c6': 'Bleu',
  'dba3be': 'Rose pale',
  '592454': 'Violet',
  'afafaf': 'Gris'
};

// Mappage des couleurs de peau corrigé selon les vraies options DiceBear
export const SKIN_COLORS: { [key: string]: string } = {
  'fdbcb4': 'Clair',
  'e0ac69': 'Moyen',
  'a1665e': 'Foncé',
  'c58c85': 'Olive'
};

// Mappage des types de cheveux basé sur les vraies options DiceBear Adventurer
export const HAIR_TYPES: { [key: string]: string } = {
  // Cheveux courts (19 options dans DiceBear)
  'short01': 'Court 1',
  'short02': 'Court 2',
  'short03': 'Court 3',
  'short04': 'Court 4',
  'short05': 'Court 5',
  'short06': 'Court 6',
  'short07': 'Court 7',
  'short08': 'Court 8',
  'short09': 'Court 9',
  'short10': 'Court 10',
  'short11': 'Court 11',
  'short12': 'Court 12',
  'short13': 'Court 13',
  'short14': 'Court 14',
  'short15': 'Court 15',
  'short16': 'Court 16',
  'short17': 'Court 17',
  'short18': 'Court 18',
  'short19': 'Court 19',
  
  // Cheveux longs (26 options dans DiceBear)
  'long01': 'Long 1',
  'long02': 'Long 2',
  'long03': 'Long 3',
  'long04': 'Long 4',
  'long05': 'Long 5',
  'long06': 'Long 6',
  'long07': 'Long 7',
  'long08': 'Long 8',
  'long09': 'Long 9',
  'long10': 'Long 10',
  'long11': 'Long 11',
  'long12': 'Long 12',
  'long13': 'Long 13',
  'long14': 'Long 14',
  'long15': 'Long 15',
  'long16': 'Long 16',
  'long17': 'Long 17',
  'long18': 'Long 18',
  'long19': 'Long 19',
  'long20': 'Long 20',
  'long21': 'Long 21',
  'long22': 'Long 22',
  'long23': 'Long 23',
  'long24': 'Long 24',
  'long25': 'Long 25',
  'long26': 'Long 26'
};

// Mappage des yeux selon les vraies options DiceBear
export const EYES_TYPES: { [key: string]: string } = {
  'variant01': 'Yeux 1',
  'variant02': 'Yeux 2',
  'variant03': 'Yeux 3',
  'variant04': 'Yeux 4',
  'variant05': 'Yeux 5',
  'variant06': 'Yeux 6',
  'variant07': 'Yeux 7',
  'variant08': 'Yeux 8',
  'variant09': 'Yeux 9',
  'variant10': 'Yeux 10',
  'variant11': 'Yeux 11',
  'variant12': 'Yeux 12',
  'variant13': 'Yeux 13',
  'variant14': 'Yeux 14',
  'variant15': 'Yeux 15',
  'variant16': 'Yeux 16',
  'variant17': 'Yeux 17',
  'variant18': 'Yeux 18',
  'variant19': 'Yeux 19',
  'variant20': 'Yeux 20',
  'variant21': 'Yeux 21',
  'variant22': 'Yeux 22',
  'variant23': 'Yeux 23'
};

// Mappage des sourcils selon les vraies options DiceBear
export const EYEBROWS_TYPES: { [key: string]: string } = {
  'variant01': 'Sourcils 1',
  'variant02': 'Sourcils 2',
  'variant03': 'Sourcils 3',
  'variant04': 'Sourcils 4',
  'variant05': 'Sourcils 5',
  'variant06': 'Sourcils 6',
  'variant07': 'Sourcils 7',
  'variant08': 'Sourcils 8',
  'variant09': 'Sourcils 9',
  'variant10': 'Sourcils 10'
};

// Mappage des bouches selon les vraies options DiceBear
export const MOUTH_TYPES: { [key: string]: string } = {
  'variant01': 'Bouche 1',
  'variant02': 'Bouche 2',
  'variant03': 'Bouche 3',
  'variant04': 'Bouche 4',
  'variant05': 'Bouche 5',
  'variant06': 'Bouche 6',
  'variant07': 'Bouche 7',
  'variant08': 'Bouche 8',
  'variant09': 'Bouche 9',
  'variant10': 'Bouche 10',
  'variant11': 'Bouche 11',
  'variant12': 'Bouche 12',
  'variant13': 'Bouche 13',
  'variant14': 'Bouche 14',
  'variant15': 'Bouche 15',
  'variant16': 'Bouche 16',
  'variant17': 'Bouche 17'
};

// Mappage des boucles d'oreilles selon les vraies options DiceBear
export const EARRINGS_TYPES: { [key: string]: string } = {
  'variant01': 'Boucles 1',
  'variant02': 'Boucles 2',
  'variant03': 'Boucles 3',
  'variant04': 'Boucles 4',
  'variant05': 'Boucles 5'
};

// Mappage des lunettes selon les vraies options DiceBear
export const GLASSES_TYPES: { [key: string]: string } = {
  'variant01': 'Lunettes 1',
  'variant02': 'Lunettes 2',
  'variant03': 'Lunettes 3'
};

// Mappage des traits du visage selon les vraies options DiceBear
export const FEATURES_TYPES: { [key: string]: string } = {
  'blush': 'Joue rosée',
  'freckles': 'Freckles',
  'lilac': 'Lilac',
  'mole': 'Grain de beauté',
  'rosyCheeks': 'Joues rosées'
};

// Types de cheveux par genre pour faciliter la sélection
export const HAIR_TYPES_BY_GENDER = {
  boy: [
    'short01', 'short02', 'short03', 'short04', 'short05', 'short06', 'short07', 'short08', 
    'short09', 'short10', 'short11', 'short12', 'short13', 'short14', 'short15', 'short16',
    'short17', 'short18', 'short19'
  ],
  girl: [
    'long01', 'long02', 'long03', 'long04', 'long05', 'long06', 'long07', 'long08',
    'long09', 'long10', 'long11', 'long12', 'long13', 'long14', 'long15', 'long16',
    'long17', 'long18', 'long19', 'long20', 'long21', 'long22', 'long23', 'long24',
    'long25', 'long26'
  ],
  unisex: [
    // Options qui fonctionnent pour tous les genres
    'short01', 'short02', 'short03', 'long01', 'long02', 'long03'
  ]
};

// Valeurs par défaut pour l'interface utilisateur
export const DEFAULT_CHILD_PROFILE: ChildProfileForm = {
  gender: 'unisex',
  hairType: 'short01',
  hairColor: '6d4c41',
  skinTone: 'e0ac69',
  eyes: 'variant01',
  eyebrows: 'variant01',
  mouth: 'variant01',
  earrings: 'variant01',
  glasses: 'variant01',
  features: 'blush'
};

// Valeurs par défaut pour la compatibilité backend
export const DEFAULT_CHILD_PROFILE_BACKEND: ChildProfileBackend = {
  gender: 'unisex',
  hairType: 'short01',
  hairColor: '6d4c41',
  skinTone: 'e0ac69',
  eyes: 'variant01',
  eyebrows: 'variant01',
  mouth: 'variant01',
  glasses: false,
  glassesStyle: 'variant01',
  accessories: ''
};

// Conversion du ChildProfileForm vers la configuration DiceBear
export function convertChildProfileToDiceBearConfig(profile: ChildProfileForm): any {
  const config: any = {
    base: ['default'],
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

  return config;
}

// Conversion de ChildProfileForm vers ChildProfileBackend (pour sauvegarde)
export function convertToBackendFormat(profile: ChildProfileForm): ChildProfileBackend {
  return {
    gender: profile.gender,
    hairType: profile.hairType,
    hairColor: profile.hairColor,
    skinTone: profile.skinTone,
    eyes: profile.eyes,
    eyebrows: profile.eyebrows,
    mouth: profile.mouth,
    glasses: profile.glasses !== 'none' && profile.glasses !== '',
    glassesStyle: profile.glasses,
    accessories: '',
    earrings: profile.earrings,
    features: profile.features
  };
}

// Conversion de ChildProfileBackend vers ChildProfileForm (pour chargement)
export function convertFromBackendFormat(backendProfile?: Partial<ChildProfileBackend>): ChildProfileForm {
  if (!backendProfile) {
    return DEFAULT_CHILD_PROFILE;
  }

  return {
    gender: backendProfile.gender || DEFAULT_CHILD_PROFILE.gender,
    hairType: backendProfile.hairType || DEFAULT_CHILD_PROFILE.hairType,
    hairColor: backendProfile.hairColor || DEFAULT_CHILD_PROFILE.hairColor,
    skinTone: backendProfile.skinTone || DEFAULT_CHILD_PROFILE.skinTone,
    eyes: backendProfile.eyes || DEFAULT_CHILD_PROFILE.eyes,
    eyebrows: backendProfile.eyebrows || DEFAULT_CHILD_PROFILE.eyebrows,
    mouth: backendProfile.mouth || DEFAULT_CHILD_PROFILE.mouth,
    earrings: backendProfile.earrings || DEFAULT_CHILD_PROFILE.earrings,
    glasses: backendProfile.glassesStyle || DEFAULT_CHILD_PROFILE.glasses,
    features: backendProfile.features || DEFAULT_CHILD_PROFILE.features
  };
}