"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateAvatarWithProgress,
  createAvatarDebounce,
  convertProfileToAvatarConfig
} from "@/utils/dicebear-options";
import {
  ChildProfileForm,
  HAIR_COLORS,
  SKIN_COLORS,
  EYES_TYPES,
  EYEBROWS_TYPES,
  MOUTH_TYPES,
  EARRINGS_TYPES,
  GLASSES_TYPES,
  FEATURES_TYPES,
  HAIR_TYPES_BY_GENDER,
  DEFAULT_CHILD_PROFILE,
  convertToBackendFormat,
  convertFromBackendFormat
} from "@/types/avatar";
import { toast } from "sonner";

interface ChildAvatarFormProps {
  userId: string;
  userProfile?: any;
}

export default function ChildAvatarForm({ userId, userProfile }: ChildAvatarFormProps) {
  const [options, setOptions] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [avatarDataUri, setAvatarDataUri] = useState<string>("");
  
  // Configuration de l'avatar avec valeurs par défaut
  const [avatarConfig, setAvatarConfig] = useState<ChildProfileForm>(DEFAULT_CHILD_PROFILE);
  
  // Référence pour éviter les génération multiples
  const generationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitialized = useRef(false);

  // Charger les options et initialiser les valeurs
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Import dynamique des options pour éviter les erreurs SSR
        const { getAdventurerOptions } = await import("@/utils/dicebear-options");
        const adventurerOptions = getAdventurerOptions();
        setOptions(adventurerOptions);
        
        // Charger les valeurs existantes du profil si disponibles
        if (userProfile?.child) {
          const convertedProfile = convertFromBackendFormat(userProfile.child);
          setAvatarConfig(convertedProfile);
        }
        
        isInitialized.current = true;
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        toast.error("Erreur lors du chargement des options d'avatar");
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [userProfile]);

  // Fonction de génération d'avatar avec gestion d'erreurs optimisée
  const generateAvatarOptimized = useCallback(async (config: ChildProfileForm) => {
    if (isGenerating) return; // Éviter les générations simultanées
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const dataUri = await generateAvatarWithProgress(config, (progress) => {
        setGenerationProgress(progress);
      });
      
      setAvatarDataUri(dataUri);
    } catch (error) {
      console.error("Erreur lors de la génération de l'avatar:", error);
      toast.error("Erreur lors de la génération de l'avatar");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(1);
    }
  }, [isGenerating]);

  // Génération initiale et mise à jour en temps réel avec debouncing
  useEffect(() => {
    if (!isInitialized.current || isLoading) return;

    // Annuler la génération précédente
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
    }

    // Programmer la nouvelle génération avec debouncing
    generationTimeoutRef.current = setTimeout(() => {
      generateAvatarOptimized(avatarConfig);
    }, 250); // Délai de debouncing directement intégré

    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [avatarConfig, isLoading, generateAvatarOptimized]);

  // Gestionnaire de changement des champs avec validation
  const handleConfigChange = useCallback((field: keyof ChildProfileForm, value: string) => {
    setAvatarConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Gestionnaire de changement de genre avec adaptation des cheveux
  const handleGenderChange = useCallback((newGender: 'boy' | 'girl' | 'unisex') => {
    const availableHairTypes = HAIR_TYPES_BY_GENDER[newGender] || HAIR_TYPES_BY_GENDER.unisex;
    const currentHairType = avatarConfig.hairType;
    const validHairType = availableHairTypes.includes(currentHairType)
      ? currentHairType
      : availableHairTypes[0];
    
    setAvatarConfig(prev => ({
      ...prev,
      gender: newGender,
      hairType: validHairType
    }));
  }, [avatarConfig.hairType]);

  // Sauvegarder le profil avec gestion d'erreurs améliorée
  const handleSave = useCallback(async () => {
    if (isSaving || !avatarDataUri) {
      toast.error("Avatar non généré ou sauvegarde en cours");
      return;
    }
    
    setIsSaving(true);
    try {
      const backendProfile = convertToBackendFormat(avatarConfig);
      const response = await fetch(`/api/users/profile/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child: backendProfile,
          childAvatar: avatarDataUri,
        }),
      });

      if (response.ok) {
        toast.success("Profil de l'enfant sauvegardé avec succès !");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  }, [avatarConfig, avatarDataUri, isSaving, userId]);

  // Générer un avatar aléatoire avec validation des options
  const handleRandomize = useCallback(() => {
    const getRandomValue = (array: string[]) => {
      if (!array || array.length === 0) return "";
      return array[Math.floor(Math.random() * array.length)];
    };
    
    const randomConfig: ChildProfileForm = {
      gender: getRandomValue(['boy', 'girl', 'unisex']),
      hairType: getRandomValue(options.hair || ["short01"]),
      hairColor: getRandomValue(options.hairColor || ["6d4c41"]),
      skinTone: getRandomValue(options.skinColor || ["e0ac69"]),
      eyes: getRandomValue(options.eyes || ["variant01"]),
      eyebrows: getRandomValue(options.eyebrows || ["variant01"]),
      mouth: getRandomValue(options.mouth || ["variant01"]),
      earrings: getRandomValue(options.earrings || ["variant01"]),
      glasses: getRandomValue(options.glasses || ["variant01"]),
      features: getRandomValue(options.features || ["blush"])
    };
    
    setAvatarConfig(randomConfig);
    toast.success("Avatar aléatoire généré !");
  }, [options]);

  // Composant de chargement pendant la génération
  const GenerationLoader = () => (
    <div className="flex flex-col items-center justify-center w-64 h-64 bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <div className="text-sm text-gray-600 mb-2">Génération en cours...</div>
      <div className="w-32 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${generationProgress * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Chargement des options d'avatar...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Aperçu de l'avatar */}
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-center">Aperçu de l'avatar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-64 h-64 border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg">
              {isGenerating ? (
                <GenerationLoader />
              ) : avatarDataUri ? (
                <Image
                  src={avatarDataUri}
                  alt="Avatar de l'enfant"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  Avatar non généré
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleRandomize}
              variant="outline"
              disabled={isGenerating}
              className="flex-1"
            >
              🎲 Aléatoire
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !avatarDataUri || isGenerating}
              className="flex-1"
            >
              {isSaving ? "Sauvegarde..." : isGenerating ? "Génération..." : "💾 Sauvegarder"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Personnalisation de l'avatar</CardTitle>
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Mise à jour en temps réel...</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="gender">Genre</Label>
            <Select
              value={avatarConfig.gender}
              onValueChange={(value) => handleGenderChange(value as 'boy' | 'girl' | 'unisex')}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boy">Garçon</SelectItem>
                <SelectItem value="girl">Fille</SelectItem>
                <SelectItem value="unisex">Non-binaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cheveux */}
          <div className="space-y-2">
            <Label htmlFor="hairType">Type de cheveux</Label>
            <Select
              value={avatarConfig.hairType}
              onValueChange={(value) => handleConfigChange("hairType", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de cheveux" />
              </SelectTrigger>
              <SelectContent>
                {(HAIR_TYPES_BY_GENDER[avatarConfig.gender as keyof typeof HAIR_TYPES_BY_GENDER] || [])
                  .map(hairType => (
                    <SelectItem key={hairType} value={hairType}>
                      {hairType}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* Couleur des cheveux */}
          <div className="space-y-2">
            <Label htmlFor="hairColor">Couleur des cheveux</Label>
            <Select
              value={avatarConfig.hairColor}
              onValueChange={(value) => handleConfigChange("hairColor", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la couleur des cheveux" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HAIR_COLORS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Couleur de peau */}
          <div className="space-y-2">
            <Label htmlFor="skinTone">Couleur de peau</Label>
            <Select
              value={avatarConfig.skinTone}
              onValueChange={(value) => handleConfigChange("skinTone", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la couleur de peau" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SKIN_COLORS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Yeux */}
          <div className="space-y-2">
            <Label htmlFor="eyes">Yeux</Label>
            <Select
              value={avatarConfig.eyes}
              onValueChange={(value) => handleConfigChange("eyes", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les yeux" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EYES_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sourcils */}
          <div className="space-y-2">
            <Label htmlFor="eyebrows">Sourcils</Label>
            <Select
              value={avatarConfig.eyebrows}
              onValueChange={(value) => handleConfigChange("eyebrows", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les sourcils" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EYEBROWS_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bouche */}
          <div className="space-y-2">
            <Label htmlFor="mouth">Bouche</Label>
            <Select
              value={avatarConfig.mouth}
              onValueChange={(value) => handleConfigChange("mouth", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la bouche" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOUTH_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Boucles d'oreilles */}
          <div className="space-y-2">
            <Label htmlFor="earrings">Boucles d'oreilles</Label>
            <Select
              value={avatarConfig.earrings}
              onValueChange={(value) => handleConfigChange("earrings", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les boucles d'oreilles" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EARRINGS_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lunettes */}
          <div className="space-y-2">
            <Label htmlFor="glasses">Lunettes</Label>
            <Select
              value={avatarConfig.glasses}
              onValueChange={(value) => handleConfigChange("glasses", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les lunettes" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GLASSES_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Traits du visage */}
          <div className="space-y-2">
            <Label htmlFor="features">Traits du visage</Label>
            <Select
              value={avatarConfig.features}
              onValueChange={(value) => handleConfigChange("features", value)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les traits du visage" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FEATURES_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
