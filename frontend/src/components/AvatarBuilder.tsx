//full-stack-limoon/frontend/src/components/AvatarBuilder.tsx
"use client";

import { useEffect, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { getAdventurerOptions } from "../utils/dicebear-options";

// ---- COMPONENT PRINCIPAL ----
export default function AvatarBuilder({
  userId,
  avatarConfig,
  initialConfig,
  showNameField = false,
  initialChildName = '',
  onComplete
}: {
  userId: string;
  avatarConfig?: Record<string, any>;
  initialConfig?: Record<string, any>;
  showNameField?: boolean;
  initialChildName?: string;
  onComplete?: (childName: string, avatarUri: string, config: Record<string, any>) => void;
}) {
  // ---------- Helpers for French localisation ----------
  const toFrenchLabel = (value: string): string => {
    // Replace hyphens/underscores with spaces, capitalize each word
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const keyToFrench = (key: string): string => {
    // Simple conversion: split camelCase, replace with spaces, capitalize
    const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    const capitalized = spaced.replace(/\b\w/g, (c) => c.toUpperCase());
    // Quelques traductions spécifiques courantes
    const map: Record<string, string> = {
      HairColor: 'Couleur des cheveux',
      EyeColor: 'Couleur des yeux',
      Mouth: 'Bouche',
      SkinColor: 'Couleur de peau',
      Accessories: 'Accessoires',
      Glasses: 'Lunettes',
      Earrings: 'Boucles d\'oreilles',
      Features: 'Caractéristiques',
    };
    return map[capitalized] || capitalized;
  };

  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [config, setConfig] = useState<Record<string, string>>({});
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [childName, setChildName] = useState<string>(initialChildName);

  console.log('🔍 AvatarBuilder: Composant monté avec userId:', userId, 'avatarConfig:', avatarConfig, 'initialConfig:', initialConfig);

  // Charger les options DiceBear
  useEffect(() => {
    console.log('🔧 AvatarBuilder: Chargement des options DiceBear...');
    const opts = getAdventurerOptions();
    setOptions(opts);
    console.log('✅ AvatarBuilder: Options chargées:', Object.keys(opts).length, 'propriétés');

    if (Object.keys(opts).length === 0) {
      console.error('❌ AvatarBuilder: Aucune option chargée - utilisation des valeurs par défaut');
    }

    // Mettre une valeur par défaut automatiquement
    const defaults: Record<string, string> = {};
    Object.keys(opts).forEach(key => {
      if (opts[key] && opts[key].length > 0) {
        defaults[key] = opts[key][0];
      }
    });

    // Merge defaults with initialConfig if provided
    const finalConfig = { ...defaults, ...(initialConfig || {}) };
    console.log('✅ AvatarBuilder: Configuration initiale (defaults + initial):', finalConfig);
    setConfig(finalConfig);
  }, []);

  // Générer l'avatar à chaque changement de config ou avatarConfig
  useEffect(() => {
    const currentConfig = avatarConfig || config;
    console.log('🎨 AvatarBuilder: Génération avatar avec config:', JSON.stringify(currentConfig));

    if (Object.keys(currentConfig).length === 0) {
      console.log('⚠️ AvatarBuilder: Configuration vide, arrêt de la génération');
      return;
    }

    setIsGenerating(true);

    try {
      // DiceBear expects options to be arrays for randomization, or single values.
      // However, best practice with this library version seems to be arrays or ensuring types match schema.
      // Let's try wrapping values in arrays to be safe, as seen in dicebear-options.ts
      const formattedConfig: Record<string, any> = {};
      Object.entries(currentConfig).forEach(([key, value]) => {
        formattedConfig[key] = Array.isArray(value) ? value : [value];
      });

      // Force probabilities to 100 if accessories are selected
      if (formattedConfig.glasses && formattedConfig.glasses.length > 0) {
        formattedConfig.glassesProbability = [100];
      }
      if (formattedConfig.earrings && formattedConfig.earrings.length > 0) {
        formattedConfig.earringsProbability = [100];
      }
      if (formattedConfig.features && formattedConfig.features.length > 0) {
        formattedConfig.featuresProbability = [100];
      }

      const avatar = createAvatar(adventurer, formattedConfig);
      const uri = avatar.toDataUri();

      if (!uri || uri === 'data:image/svg+xml;utf8,') {
        console.error('❌ AvatarBuilder: URI généré vide ou invalide');
        throw new Error('URI invalid');
      }

      console.log('✅ AvatarBuilder: Avatar généré avec succès. Longueur URI:', uri.length);
      setAvatarUri(uri);
      setIsGenerating(false);
    } catch (error) {
      console.error('❌ AvatarBuilder: Erreur génération avatar:', error);

      // Fallback
      try {
        const fallbackConfig = { backgroundColor: ['b6e3f4'] };
        const fallbackAvatar = createAvatar(adventurer, fallbackConfig);
        const fallbackUri = fallbackAvatar.toDataUri();
        console.log('✅ AvatarBuilder: Fallback avatar généré');
        setAvatarUri(fallbackUri);
      } catch (fallbackError) {
        console.error('❌ AvatarBuilder: Echec total du fallback:', fallbackError);
      }
      setIsGenerating(false);
    }
  }, [config, avatarConfig]);

  // Randomisation
  const randomize = () => {
    console.log('🎲 AvatarBuilder: Randomisation des options...');
    const newConfig: any = {};
    Object.entries(options).forEach(([key, values]) => {
      const randomValue = values[Math.floor(Math.random() * values.length)];
      newConfig[key] = randomValue;
    });
    console.log('✅ AvatarBuilder: Nouvelle config random:', newConfig);
    setConfig(newConfig);
  };

  // Sauvegarde backend
  const saveAvatar = async () => {
    console.log('💾 AvatarBuilder: Tentative de sauvegarde...');

    if (!avatarUri) {
      alert("⚠️ Aucun avatar à sauvegarder ! Générez d'abord un avatar.");
      return;
    }

    if (showNameField && !childName.trim()) {
      alert("⚠️ Veuillez entrer le nom de l'enfant.");
      return;
    }

    try {
      // If onComplete callback is provided, use it instead of direct save
      if (onComplete) {
        console.log('✅ AvatarBuilder: Calling onComplete callback');
        onComplete(childName, avatarUri, config);
        return;
      }

      // Otherwise, save directly to backend
      const res = await fetch(`/api/users/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child: { name: childName, ...config },
          childAvatar: avatarUri
        }),
      });

      if (res.ok) {
        console.log('✅ AvatarBuilder: Sauvegarde réussie');
        alert("✅ Avatar sauvegardé avec succès !");
      } else {
        console.error('❌ AvatarBuilder: Erreur serveur:', await res.text());
        alert("❌ Erreur lors de la sauvegarde (status: " + res.status + ")");
      }
    } catch (error) {
      console.error('❌ AvatarBuilder: Erreur réseau:', error);
      alert("❌ Erreur de connexion lors de la sauvegarde");
    }
  };

  return (
    <div className="p-1 max-w-5xl mx-auto">

      <h1 className="text-xl font-semibold mb-6 text-slate-900">Créer un avatar</h1>

      {/* Child Name Field */}
      {showNameField && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-slate-700">
            Nom de l'enfant *
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="w-full border-0 bg-slate-100 p-3 rounded-lg focus:ring-2 focus:ring-[#0055FF] text-sm transition-all"
            placeholder="Entrez le prénom"
            required
          />
        </div>
      )}

      <div className="flex gap-10 flex-col">

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="relative w-56 h-56 mb-8">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-full z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0055FF]"></div>
              </div>
            )}
            <img
              src={avatarUri || "/placeholder-avatar.svg"}
              className="w-56 h-56 rounded-full shadow-xl border-4 border-white bg-slate-50"
              alt="Avatar Preview"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = "/placeholder-avatar.svg";
              }}
            />
          </div>

          {!avatarConfig && (
            <div className="flex gap-3 w-full max-w-xs">
              <button
                onClick={randomize}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
              >
                Aléatoire 🎲
              </button>

              <button
                onClick={saveAvatar}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#0055FF] hover:bg-[#0044CC] text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Enregistrer ✓
              </button>
            </div>
          )}
        </div>

        {/* PANNEAU D'OPTIONS */}
        {!avatarConfig && (
          <div className="w-full">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-slate-900 text-lg">Personnalisation</h3>
                <button
                  onClick={() => {
                    const defaults: any = {};
                    Object.entries(options).forEach(([key, values]) => {
                      defaults[key] = values[0];
                    });
                    setConfig(defaults);
                  }}
                  className="text-sm text-[#0055FF] hover:underline font-medium"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                {Object.entries(options)
                  .filter(([key]) => key !== 'features')
                  .map(([key, values]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {keyToFrench(key)}
                      </label>

                      <select
                        className="w-full border-0 bg-slate-50 p-3 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-[#0055FF] transition-all cursor-pointer hover:bg-slate-100"
                        value={config[key]}
                        onChange={(e) => {
                          const newConfig = { ...config, [key]: e.target.value };
                          setConfig(newConfig);
                        }}
                      >
                        {values.map((v) => (
                          <option key={v} value={v}>
                            {toFrenchLabel(v)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
