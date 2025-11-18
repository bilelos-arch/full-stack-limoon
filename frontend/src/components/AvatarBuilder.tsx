//full-stack-limoon/frontend/src/components/AvatarBuilder.tsx
"use client";

import { useEffect, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import { getAdventurerOptions } from "../utils/dicebear-options";

// ---- COMPONENT PRINCIPAL ----
export default function AvatarBuilder({ userId, avatarConfig }: { userId: string; avatarConfig?: Record<string, any> }) {
   console.log('🔍 AvatarBuilder: Composant monté avec userId:', userId, 'avatarConfig:', avatarConfig);
   const [options, setOptions] = useState<Record<string, string[]>>({});
   const [config, setConfig] = useState<Record<string, string>>({});
   const [avatarUri, setAvatarUri] = useState<string>("");
   const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Charger les options DiceBear
  useEffect(() => {
    console.log('🔧 AvatarBuilder: Chargement des options DiceBear...');
    const opts = getAdventurerOptions();
    console.log('✅ AvatarBuilder: Options chargées:', Object.keys(opts).length, 'propriétés');
    
    if (Object.keys(opts).length === 0) {
      console.error('❌ AvatarBuilder: Aucune option chargée - utilisation des valeurs par défaut');
      // Fallback avec des valeurs par défaut statiques
      const fallbackOptions = {
        hair: ['short01', 'long01'],
        hairColor: ['6d4c41', 'f5c842'],
        skinColor: ['e0ac69', 'fdbcb4'],
        eyes: ['variant01', 'variant02'],
        eyebrows: ['variant01', 'variant02'],
        mouth: ['variant01', 'variant02'],
        earrings: ['variant01'],
        glasses: ['variant01'],
        features: ['blush'],
        backgroundColor: ['b6e3f4']
      };
      setOptions(fallbackOptions);
      
      // Configuration par défaut avec fallback
      const fallbackConfig: any = {};
      Object.entries(fallbackOptions).forEach(([key, values]) => {
        fallbackConfig[key] = [values[0]];
      });
      setConfig(fallbackConfig);
      return;
    }
    
    setOptions(opts);

    // Mettre une valeur par défaut automatiquement
    const defaults: any = {};
    Object.entries(opts).forEach(([key, values]) => {
      defaults[key] = values[0]; // première option
    });
    console.log('✅ AvatarBuilder: Configuration par défaut:', defaults);
    setConfig(defaults);
  }, []);

  // Générer l'avatar à chaque changement de config ou avatarConfig
    useEffect(() => {
      const currentConfig = avatarConfig || config;
      console.log('🎨 AvatarBuilder: Génération avatar avec config:', currentConfig);
      console.log('🎨 AvatarBuilder: avatarConfig fourni:', avatarConfig);
      console.log('🎨 AvatarBuilder: config interne:', config);
      console.log('🎨 AvatarBuilder: Priorité donnée à avatarConfig:', !!avatarConfig);
      console.log('🔍 AvatarBuilder: Whether avatar generation succeeds or fails: Starting generation...');

      if (Object.keys(currentConfig).length === 0) {
        console.log('⚠️ AvatarBuilder: Configuration vide, arrêt de la génération');
        console.log('⚠️ AvatarBuilder: avatarConfig vide:', !avatarConfig || Object.keys(avatarConfig).length === 0);
        console.log('⚠️ AvatarBuilder: config interne vide:', Object.keys(config).length === 0);
        return;
      }

    setIsGenerating(true);
    
    try {
      const avatar = createAvatar(adventurer, currentConfig as any);
      const uri = avatar.toDataUri();
      console.log('✅ AvatarBuilder: Avatar généré avec succès:', uri.substring(0, 50) + '...');
      console.log('🔍 AvatarBuilder: Whether avatar generation succeeds or fails: SUCCESS');
      setAvatarUri(uri);
      console.log('🎯 AvatarBuilder: Final avatarUri value:', uri);
      setIsGenerating(false);
    } catch (error) {
      console.error('❌ AvatarBuilder: Erreur génération avatar:', error);
      console.log('🔍 AvatarBuilder: Whether avatar generation succeeds or fails: FAILED - attempting fallback');
      console.log('� AvatarBuilder: Tentative avec configuration fallback...');
      // Configuration fallback minimale
      try {
        const fallbackConfig = { backgroundColor: ['b6e3f4'] };
        const fallbackAvatar = createAvatar(adventurer, fallbackConfig);
        const fallbackUri = fallbackAvatar.toDataUri();
        console.log('✅ AvatarBuilder: Fallback avatar généré:', fallbackUri.substring(0, 50) + '...');
        console.log('🔍 AvatarBuilder: Whether avatar generation succeeds or fails: SUCCESS (fallback)');
        console.log('🎯 AvatarBuilder: Final avatarUri value (fallback):', fallbackUri);
        setAvatarUri(fallbackUri);
        setIsGenerating(false);
      } catch (fallbackError) {
        console.error('❌ AvatarBuilder: Erreur critique fallback:', fallbackError);
        console.log('💔 AvatarBuilder: Aucun avatar générable');
        console.log('🔍 AvatarBuilder: Whether avatar generation succeeds or fails: FAILED (no fallback)');
        console.log('🎯 AvatarBuilder: Final avatarUri value (error):', avatarUri || 'undefined');
        setIsGenerating(false);
      }
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

    try {
      const res = await fetch(`/api/users/profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUri }),
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
    <div className="p-6 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Créer un avatar pour votre enfant</h1>

      <div className="flex gap-10 flex-col md:flex-row">

        {/* PREVIEW */}
        <div className="flex flex-col items-center">
          <div className="relative w-60 h-60">
            {isGenerating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-purple-600 font-medium">Génération...</span>
              </div>
            )}
            <img
               src={avatarUri || "/placeholder-avatar.svg"}
               className="w-60 h-60 rounded-xl shadow-xl border"
               alt="Avatar Preview"
               onError={(e) => {
                 console.log('❌ AvatarBuilder: Erreur chargement image:', avatarUri || "/placeholder-avatar.svg");
                 console.log('❌ AvatarBuilder: avatarUri actuel:', avatarUri);
                 console.log('❌ AvatarBuilder: isGenerating:', isGenerating);
                 if (avatarUri) {
                   console.log('💡 AvatarBuilder: L\'avatarUri est défini mais l\'image ne se charge pas');
                   // Fallback vers SVG si PNG échoue
                   const img = e.target as HTMLImageElement;
                   img.src = "/placeholder-avatar.svg";
                 }
               }}
               onLoad={() => {
                 console.log('✅ AvatarBuilder: Image chargée avec succès');
               }}
             />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Statut: {avatarUri ? 'Avatar généré' : 'En cours de génération...'}
          </div>

          {!avatarConfig && (
            <>
              <button
                onClick={randomize}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
              >
                Random Avatar 🎲
              </button>

              <button
                onClick={saveAvatar}
                className="mt-3 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
              >
                Enregistrer l’avatar ✓
              </button>
            </>
          )}
        </div>

        {/* PANNEAU D'OPTIONS */}
        {!avatarConfig && (
          <div className="w-full max-w-md">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-lg mb-2">🔧 Personnaliser l'avatar</h3>
              <p className="text-sm text-gray-600 mb-3">
                Utilisez les options ci-dessous pour créer l'avatar parfait pour votre enfant
              </p>
              <button
                onClick={() => {
                  console.log('🔄 AvatarBuilder: Régénération complète...');
                  const defaults: any = {};
                  Object.entries(options).forEach(([key, values]) => {
                    defaults[key] = values[0];
                  });
                  setConfig(defaults);
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Réinitialiser aux valeurs par défaut
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(options).map(([key, values]) => (
                <div key={key} className="flex flex-col bg-white p-3 rounded-lg border border-gray-200">
                  <label className="text-sm font-semibold mb-2 text-gray-800 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>

                  <select
                    className="border border-gray-300 p-2 rounded-md bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    value={config[key]}
                    onChange={(e) => {
                      const newConfig = { ...config, [key]: e.target.value };
                      console.log('🔄 AvatarBuilder: Changement', key, '->', e.target.value);
                      setConfig(newConfig);
                    }}
                  >
                    {values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">💡 Conseils</h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Utilisez le bouton "Random Avatar 🎲" pour une création rapide</li>
                <li>• N'oubliez pas de sauvegarder votre création avec "Enregistrer l'avatar ✓"</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
