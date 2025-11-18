"use client";
import React, { useEffect, useState } from "react";
import AvatarBuilder from "@/components/AvatarBuilder";

interface UserData {
  child?: {
    name: string;
    age: string;
    gender: string;
    mood: string;
    hairType: string;
    hairColor: string;
    skinTone: string;
    eyes: string;
    eyebrows: string;
    mouth: string;
    glasses: boolean;
    glassesStyle: string;
    accessories: string;
    earrings: string;
    features: string;
  };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log('🔍 Page histoires hero: ID utilisateur reçu:', id);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                console.log('🔍 Page histoires hero: Récupération des données utilisateur...');
                const response = await fetch(`/api/users/profile/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log('✅ Page histoires hero: Données utilisateur récupérées:', data);
                console.log('🔍 Page histoires hero: API response from /api/users/profile/${id}:', data);
                setUserData(data);
            } catch (err) {
                console.error('❌ Page histoires hero: Erreur récupération données:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id]);

    // Mapper les propriétés user.child vers le format DiceBear
    const mapChildToAvatarConfig = (child: UserData['child']): Record<string, string> => {
        if (!child) {
            console.log('⚠️ Page histoires hero: Aucun enfant trouvé dans les données utilisateur');
            return {};
        }

        console.log('🔍 Page histoires hero: Données enfant reçues:', child);

        const config: Record<string, string> = {};

        // Mapping des propriétés
        if (child.hairType) config.hair = child.hairType;
        if (child.hairColor) config.hairColor = child.hairColor;
        if (child.skinTone) config.skinColor = child.skinTone;
        if (child.eyes) config.eyes = child.eyes;
        if (child.eyebrows) config.eyebrows = child.eyebrows;
        if (child.mouth) config.mouth = child.mouth;
        if (child.glasses && child.glassesStyle) config.glasses = child.glassesStyle;
        if (child.earrings) config.earrings = child.earrings;
        if (child.features) config.features = child.features;

        // Valeur par défaut pour backgroundColor
        config.backgroundColor = 'b6e3f4';

        console.log('🔄 Page histoires hero: Configuration avatar mappée:', config);
        console.log('🔄 Page histoires hero: Nombre de propriétés mappées:', Object.keys(config).length);
        console.log('🔍 Page histoires hero: Mapped avatarConfig:', config);
        return config;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-purple-600">Chargement...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600">Erreur: {error}</div>
            </div>
        );
    }

    const avatarConfig = userData?.child ? mapChildToAvatarConfig(userData.child) : {};

    console.log('🎯 Page histoires hero: Configuration finale avatar:', avatarConfig);
    console.log('🎯 Page histoires hero: Rendu AvatarBuilder avec userId:', id, 'et avatarConfig:', Object.keys(avatarConfig).length, 'propriétés');
    console.log('🔍 Page histoires hero: Whether avatar generation succeeds or fails: To be determined in AvatarBuilder');

    return <AvatarBuilder userId={id} avatarConfig={avatarConfig} />;
}